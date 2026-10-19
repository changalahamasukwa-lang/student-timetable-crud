const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const fields = ['course_code', 'course_name', 'day_of_week', 'start_time', 'end_time', 'venue', 'goal'];
const fallbackFile = path.join(__dirname, 'data', 'timetable.json');
let fallbackMode = false;

const defaultCourses = [
  { id: 1, course_code: 'ICT251', course_name: 'Web Technologies', day_of_week: 'Monday', start_time: '08:00:00', end_time: '10:00:00', venue: 'Computer Lab 1', goal: 'Practise HTML, CSS and JavaScript' },
  { id: 2, course_code: 'CSC201', course_name: 'Data Structures', day_of_week: 'Monday', start_time: '10:30:00', end_time: '12:30:00', venue: 'Lecture Room A', goal: 'Review linked lists' },
  { id: 3, course_code: 'MAT201', course_name: 'Discrete Mathematics', day_of_week: 'Tuesday', start_time: '08:00:00', end_time: '10:00:00', venue: 'Lecture Room B', goal: 'Solve logic exercises' },
  { id: 4, course_code: 'CSC202', course_name: 'Database Systems', day_of_week: 'Tuesday', start_time: '10:30:00', end_time: '12:30:00', venue: 'Computer Lab 2', goal: 'Practise SQL queries' },
  { id: 5, course_code: 'ICT252', course_name: 'Networking', day_of_week: 'Wednesday', start_time: '08:00:00', end_time: '10:00:00', venue: 'Lab 3', goal: 'Revise subnetting' },
  { id: 6, course_code: 'CSC203', course_name: 'Object-Oriented Programming', day_of_week: 'Wednesday', start_time: '10:30:00', end_time: '12:30:00', venue: 'Computer Lab 1', goal: 'Write Java classes' },
  { id: 7, course_code: 'ENG201', course_name: 'Communication Skills', day_of_week: 'Thursday', start_time: '08:00:00', end_time: '10:00:00', venue: 'Lecture Room C', goal: 'Prepare presentation' },
  { id: 8, course_code: 'CSC204', course_name: 'Computer Architecture', day_of_week: 'Thursday', start_time: '10:30:00', end_time: '12:30:00', venue: 'Lecture Room A', goal: 'Revise CPU components' },
  { id: 9, course_code: 'ICT253', course_name: 'Systems Analysis', day_of_week: 'Friday', start_time: '08:00:00', end_time: '10:00:00', venue: 'Lecture Room B', goal: 'Draw use-case diagrams' },
  { id: 10, course_code: 'CSC205', course_name: 'Algorithms', day_of_week: 'Friday', start_time: '10:30:00', end_time: '12:30:00', venue: 'Computer Lab 2', goal: 'Practise sorting algorithms' }
];

function validate(body, partial = false) {
  const required = ['course_code', 'course_name', 'day_of_week', 'start_time', 'end_time', 'venue'];
  if (!partial) {
    for (const field of required) {
      if (body[field] === undefined || String(body[field]).trim() === '') return `${field} is required`;
    }
  }
  for (const field of fields) {
    if (body[field] !== undefined && body[field] !== null && typeof body[field] !== 'string') return `${field} must be text`;
  }
  return null;
}

function readFallbackCourses() {
  try {
    fs.mkdirSync(path.dirname(fallbackFile), { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      fs.writeFileSync(fallbackFile, JSON.stringify(defaultCourses, null, 2));
    }
    const raw = fs.readFileSync(fallbackFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultCourses;
  } catch (error) {
    console.error('Fallback store failed to read:', error.message);
    return defaultCourses;
  }
}

function writeFallbackCourses(courses) {
  fs.mkdirSync(path.dirname(fallbackFile), { recursive: true });
  fs.writeFileSync(fallbackFile, JSON.stringify(courses, null, 2));
}

function sortCourses(courses) {
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return [...courses].sort((a, b) => {
    const diff = (order.indexOf(a.day_of_week) ?? 0) - (order.indexOf(b.day_of_week) ?? 0);
    if (diff !== 0) return diff;
    return String(a.start_time || '00:00:00').localeCompare(String(b.start_time || '00:00:00'));
  });
}

async function mysqlAvailable() {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (_error) {
    fallbackMode = true;
    return false;
  }
}

app.get('/', (_req, res) => res.json({ message: 'Student Timetable API is running', endpoints: '/api/timetable' }));

// GET all timetable records
app.get('/api/timetable', async (_req, res) => {
  try {
    if (fallbackMode) {
      const courses = sortCourses(readFallbackCourses());
      return res.json(courses);
    }
    const [rows] = await db.query('SELECT * FROM timetable ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time');
    return res.json(rows);
  } catch (error) {
    console.error(error);
    const fallbackCourses = sortCourses(readFallbackCourses());
    return res.json(fallbackCourses);
  }
});

// GET one timetable record
app.get('/api/timetable/:id', async (req, res) => {
  try {
    if (fallbackMode) {
      const course = readFallbackCourses().find(item => String(item.id) === String(req.params.id));
      if (!course) return res.status(404).json({ error: 'Timetable record not found' });
      return res.json(course);
    }
    const [rows] = await db.execute('SELECT * FROM timetable WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Timetable record not found' });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    const course = readFallbackCourses().find(item => String(item.id) === String(req.params.id));
    if (!course) return res.status(404).json({ error: 'Timetable record not found' });
    return res.json(course);
  }
});

// POST create record
app.post('/api/timetable', async (req, res) => {
  const problem = validate(req.body);
  if (problem) return res.status(400).json({ error: problem });
  try {
    if (fallbackMode) {
      const courses = readFallbackCourses();
      const nextId = courses.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      const newCourse = { id: nextId, ...fields.reduce((acc, field) => ({ ...acc, [field]: req.body[field] ?? null }), {}) };
      const updatedCourses = sortCourses([...courses, newCourse]);
      writeFallbackCourses(updatedCourses);
      return res.status(201).json(newCourse);
    }
    const values = fields.map(field => req.body[field] ?? null);
    const [result] = await db.execute(
      'INSERT INTO timetable (course_code, course_name, day_of_week, start_time, end_time, venue, goal) VALUES (?, ?, ?, ?, ?, ?, ?)', values
    );
    const [rows] = await db.execute('SELECT * FROM timetable WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    const courses = readFallbackCourses();
    const nextId = courses.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const newCourse = { id: nextId, ...fields.reduce((acc, field) => ({ ...acc, [field]: req.body[field] ?? null }), {}) };
    const updatedCourses = sortCourses([...courses, newCourse]);
    writeFallbackCourses(updatedCourses);
    return res.status(201).json(newCourse);
  }
});

// PUT update record
app.put('/api/timetable/:id', async (req, res) => {
  const problem = validate(req.body);
  if (problem) return res.status(400).json({ error: problem });
  try {
    if (fallbackMode) {
      const courses = readFallbackCourses();
      const targetIndex = courses.findIndex(course => String(course.id) === String(req.params.id));
      if (targetIndex === -1) return res.status(404).json({ error: 'Timetable record not found' });
      const updatedCourse = { ...courses[targetIndex], ...fields.reduce((acc, field) => ({ ...acc, [field]: req.body[field] ?? null }), {}) };
      const updatedCourses = sortCourses(courses.map(course => String(course.id) === String(req.params.id) ? updatedCourse : course));
      writeFallbackCourses(updatedCourses);
      return res.json(updatedCourse);
    }
    const values = fields.map(field => req.body[field] ?? null);
    const [result] = await db.execute(
      'UPDATE timetable SET course_code=?, course_name=?, day_of_week=?, start_time=?, end_time=?, venue=?, goal=? WHERE id=?', [...values, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Timetable record not found' });
    const [rows] = await db.execute('SELECT * FROM timetable WHERE id = ?', [req.params.id]);
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    const courses = readFallbackCourses();
    const targetIndex = courses.findIndex(course => String(course.id) === String(req.params.id));
    if (targetIndex === -1) return res.status(404).json({ error: 'Timetable record not found' });
    const updatedCourse = { ...courses[targetIndex], ...fields.reduce((acc, field) => ({ ...acc, [field]: req.body[field] ?? null }), {}) };
    const updatedCourses = sortCourses(courses.map(course => String(course.id) === String(req.params.id) ? updatedCourse : course));
    writeFallbackCourses(updatedCourses);
    return res.json(updatedCourse);
  }
});

// DELETE record
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    if (fallbackMode) {
      const courses = readFallbackCourses();
      const courseExists = courses.some(course => String(course.id) === String(req.params.id));
      if (!courseExists) return res.status(404).json({ error: 'Timetable record not found' });
      const remainingCourses = courses.filter(course => String(course.id) !== String(req.params.id));
      writeFallbackCourses(remainingCourses);
      return res.json({ message: 'Timetable record deleted successfully', id: Number(req.params.id) });
    }
    const [result] = await db.execute('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Timetable record not found' });
    return res.json({ message: 'Timetable record deleted successfully', id: Number(req.params.id) });
  } catch (error) {
    console.error(error);
    const courses = readFallbackCourses();
    const courseExists = courses.some(course => String(course.id) === String(req.params.id));
    if (!courseExists) return res.status(404).json({ error: 'Timetable record not found' });
    const remainingCourses = courses.filter(course => String(course.id) !== String(req.params.id));
    writeFallbackCourses(remainingCourses);
    return res.json({ message: 'Timetable record deleted successfully', id: Number(req.params.id) });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: 'Invalid request' });
});

app.listen(PORT, async () => {
  const mysqlConnected = await mysqlAvailable();
  if (!mysqlConnected) {
    console.log('MySQL unavailable. Using local fallback timetable store.');
  }
  console.log(`Student Timetable API running at http://localhost:${PORT}`);
});
