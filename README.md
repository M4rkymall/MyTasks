# Task Management System — Frontend + Backend Integration

This folder combines the React frontend supplied by your teammate with the Express/SQLite task API.

## 1. Start the backend
Open a terminal:
```powershell
cd backend
npm install
npm start
```
Backend health check: http://localhost:3000/health

## 2. Start the frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

The Vite development proxy forwards `/api` and `/health` requests to the backend at `http://localhost:3000`. Keep both terminals running.

## 3. Test the backend
In a terminal inside `backend`:
```powershell
npm test
```

## Notes
- The frontend now reads and writes tasks through the backend API instead of browser localStorage.
- The SQLite database is created automatically at `backend/db/tasks.db`.
- `backend/db/seed.sql` contains sample records, but it is not run automatically. Use a SQLite client to execute it if you want demo data; otherwise add tasks through the website.
- This is an integration-ready development project, not yet the complete SYSIN deployment stack. Your group still needs to coordinate Docker Compose, reverse proxy, persistent database volume, Jenkins pipeline, and the third application module.
