# Student Timetable & Goals CRUD App (ICT251)

A single-table CRUD application using Node.js, Express, MySQL, HTML, CSS and JavaScript.

## Requirements
- Node.js (LTS)
- MySQL Server and a client such as MySQL Workbench
- Postman
- VS Code

## 1. Create the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Open `backend/schema.sql` and run the entire script. It creates `campus_crud`, the `timetable` table, and 10 sample records.

## 2. Configure and start the backend
In a terminal, open the project folder and run:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm start
```

Edit `backend/.env` if your MySQL username/password or port is different. Keep the `.env` file private. Expected API base URL: `http://localhost:3000/api/timetable`.

If you use Command Prompt instead of PowerShell, copy `.env.example` to `.env` with:

```bat
copy .env.example .env
```

## 3. Open the frontend
Open `frontend/index.html` in a browser. For best results in VS Code, install/use Live Server and choose **Open with Live Server**. Ensure the backend terminal is still running. The frontend calls `http://localhost:3000/api/timetable`.

## 4. API endpoints
| Method | URL | Purpose |
|---|---|---|
| GET | `http://localhost:3000/api/timetable` | List all courses |
| GET | `http://localhost:3000/api/timetable/1` | Get course with ID 1 |
| POST | `http://localhost:3000/api/timetable` | Add a course |
| PUT | `http://localhost:3000/api/timetable/1` | Update course with ID 1 |
| DELETE | `http://localhost:3000/api/timetable/1` | Delete course with ID 1 |

### POST body (choose Body > raw > JSON in Postman)
```json
{
  "course_code": "ICT251",
  "course_name": "Web Technologies",
  "day_of_week": "Monday",
  "start_time": "08:00:00",
  "end_time": "10:00:00",
  "venue": "Computer Lab 1",
  "goal": "Practise JavaScript"
}
```
For PUT, use the same JSON body and a valid record ID. Test DELETE last because it removes the selected record. GET requests do not need a request body.

## 5. Postman evidence video
Record your screen and show each request and its JSON response. Demonstrate GET all, GET one, POST, PUT, and DELETE. Use a test record for POST/PUT/DELETE so the sample data remains available. GET and DELETE do not require a request body; show the URL, HTTP method, and response for each. Save the recording as required by your lecturer.

## 6. Troubleshooting
- `ECONNREFUSED` / database connection error: confirm MySQL is running and `.env` values are correct.
- `Unknown database 'campus_crud'`: run `schema.sql` in MySQL Workbench.
- Frontend cannot fetch data: start the backend, check `http://localhost:3000/`, and confirm `API_URL` in `frontend/app.js`.
- Port already in use: change `PORT` in `.env` and update `API_URL` in `frontend/app.js` to match.

## Deployment note
The project is configured for local development. For cloud deployment, host the Node API and MySQL-compatible database, set environment variables in the hosting dashboard, update `API_URL` to the deployed API URL, and test the public endpoints. Do not submit local `localhost` URLs as public API links. Never upload database passwords.
