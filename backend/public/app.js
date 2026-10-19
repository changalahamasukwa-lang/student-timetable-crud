// If you deploy the backend, replace this URL with your deployed API URL.
const API_URL = (location.protocol === 'file:' || (location.hostname === 'localhost' && location.port !== '3000')) ? 'http://localhost:3000/api/timetable' : '/api/timetable';
const form = document.getElementById('course-form');
const list = document.getElementById('course-list');
const message = document.getElementById('message');
const fields = ['course_code', 'course_name', 'day_of_week', 'start_time', 'end_time', 'venue', 'goal'];
const byId = id => document.getElementById(id);
const themeToggle = byId('theme-toggle');

function applyTheme(theme) {
  const root = document.documentElement;
  const isLight = theme === 'light';
  root.style.setProperty('--bg1', isLight ? '#f4f1ee' : '#111111');
  root.style.setProperty('--bg2', isLight ? '#f2ece6' : '#181818');
  root.style.setProperty('--panel', isLight ? '#fffdfb' : '#1a1a1a');
  root.style.setProperty('--panel-alt', isLight ? '#f3efe9' : '#141414');
  root.style.setProperty('--red', isLight ? '#a6101d' : '#b30d1d');
  root.style.setProperty('--red-deep', isLight ? '#7b0b1b' : '#7a0916');
  root.style.setProperty('--line', isLight ? '#d7cfc6' : '#3b3b3b');
  root.style.setProperty('--text', isLight ? '#111111' : '#f5f5f5');
  root.style.setProperty('--muted', isLight ? '#4d4d4d' : '#d9d9d9');
  root.style.setProperty('--input', isLight ? '#ffffff' : '#171717');
  root.style.setProperty('--header-1', isLight ? '#f5f3f0' : '#0d0d0d');
  root.style.setProperty('--header-2', isLight ? '#e9d9d1' : '#2a0a0d');
  root.style.setProperty('--header-text', isLight ? '#111111' : '#ffffff');
  root.style.setProperty('--button-secondary', isLight ? '#f3efe9' : '#2a2a2a');
  root.style.setProperty('--button-secondary-text', isLight ? '#111111' : '#f5f5f5');
  root.style.setProperty('--table-head', isLight ? '#f7f2ee' : '#1d1d1d');
  root.style.setProperty('--table-head-text', isLight ? '#2a2a2a' : '#f5d7db');
  document.body.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = isLight ? 'Dark mode' : 'Light mode';
  }
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#b42318' : '#167647';
}
function formatTime(value) { return value ? String(value).slice(0, 5) : ''; }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function loadCourses() {
  list.innerHTML = '<tr><td colspan="7">Loading records...</td></tr>';
  try {
    const courses = await request(API_URL);
    if (!courses.length) { list.innerHTML = '<tr><td colspan="7">No courses yet. Add one using the form above.</td></tr>'; return; }
    list.innerHTML = courses.map(course => `
      <tr>
        <td>${course.id}</td>
        <td><strong>${escapeHtml(course.course_code)}</strong><br>${escapeHtml(course.course_name)}</td>
        <td>${escapeHtml(course.day_of_week)}</td>
        <td>${escapeHtml(formatTime(course.start_time))}–${escapeHtml(formatTime(course.end_time))}</td>
        <td>${escapeHtml(course.venue)}</td>
        <td>${escapeHtml(course.goal || '—')}</td>
        <td><button class="edit" data-edit="${course.id}">Edit</button><button class="delete" data-delete="${course.id}">Delete</button></td>
      </tr>`).join('');
  } catch (error) {
    list.innerHTML = `<tr><td colspan="7">Could not load records. Start the backend and check your database.</td></tr>`;
    showMessage(error.message, true);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const id = byId('course-id').value;
  const payload = Object.fromEntries(fields.map(field => [field, byId(field).value.trim()]));
  if (payload.end_time <= payload.start_time) { showMessage('End time must be later than start time.', true); return; }
  try {
    await request(id ? `${API_URL}/${id}` : API_URL, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    resetForm();
    showMessage(id ? 'Course updated successfully.' : 'Course added successfully.');
    await loadCourses();
  } catch (error) { showMessage(error.message, true); }
});

list.addEventListener('click', async event => {
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');
  if (editButton) {
    try {
      const course = await request(`${API_URL}/${editButton.dataset.edit}`);
      byId('course-id').value = course.id;
      fields.forEach(field => byId(field).value = field.includes('time') ? formatTime(course[field]) : (course[field] ?? ''));
      byId('form-title').textContent = 'Edit course';
      byId('save-button').textContent = 'Update course';
      byId('cancel-button').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showMessage(`Editing ${course.course_code}.`);
    } catch (error) { showMessage(error.message, true); }
  }
  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    if (!confirm(`Delete timetable record #${id}?`)) return;
    try {
      await request(`${API_URL}/${id}`, { method: 'DELETE' });
      showMessage('Course deleted successfully.');
      if (byId('course-id').value === id) resetForm();
      await loadCourses();
    } catch (error) { showMessage(error.message, true); }
  }
});

function resetForm() {
  form.reset();
  byId('course-id').value = '';
  byId('form-title').textContent = 'Add a course';
  byId('save-button').textContent = 'Save course';
  byId('cancel-button').hidden = true;
}
byId('cancel-button').addEventListener('click', resetForm);
byId('refresh-button').addEventListener('click', loadCourses);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });
}
applyTheme('dark');
loadCourses();
