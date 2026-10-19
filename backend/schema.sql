CREATE DATABASE IF NOT EXISTS campus_crud;
USE campus_crud;

CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(150) NOT NULL,
  day_of_week VARCHAR(15) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(100) NOT NULL,
  goal VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO timetable (course_code, course_name, day_of_week, start_time, end_time, venue, goal) VALUES
('ICT251', 'Web Technologies', 'Monday', '08:00:00', '10:00:00', 'Computer Lab 1', 'Practise HTML, CSS and JavaScript'),
('CSC201', 'Data Structures', 'Monday', '10:30:00', '12:30:00', 'Lecture Room A', 'Review linked lists'),
('MAT201', 'Discrete Mathematics', 'Tuesday', '08:00:00', '10:00:00', 'Lecture Room B', 'Solve logic exercises'),
('CSC202', 'Database Systems', 'Tuesday', '10:30:00', '12:30:00', 'Computer Lab 2', 'Practise SQL queries'),
('ICT252', 'Networking', 'Wednesday', '08:00:00', '10:00:00', 'Lab 3', 'Revise subnetting'),
('CSC203', 'Object-Oriented Programming', 'Wednesday', '10:30:00', '12:30:00', 'Computer Lab 1', 'Write Java classes'),
('ENG201', 'Communication Skills', 'Thursday', '08:00:00', '10:00:00', 'Lecture Room C', 'Prepare presentation'),
('CSC204', 'Computer Architecture', 'Thursday', '10:30:00', '12:30:00', 'Lecture Room A', 'Revise CPU components'),
('ICT253', 'Systems Analysis', 'Friday', '08:00:00', '10:00:00', 'Lecture Room B', 'Draw use-case diagrams'),
('CSC205', 'Algorithms', 'Friday', '10:30:00', '12:30:00', 'Computer Lab 2', 'Practise sorting algorithms');
