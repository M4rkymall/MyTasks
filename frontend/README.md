# Task Management System

## Project Overview

The Task Management System is a web-based application developed using React.js and Vite. It helps users organize, manage, and monitor their daily tasks through a simple and user-friendly interface.

Users can create tasks, edit existing tasks, set priorities and deadlines, update task statuses, search and filter tasks, and delete completed or unnecessary records.

The system also includes a dashboard that displays task statistics and progress.

The frontend currently uses browser localStorage for data storage while backend integration is pending.

## Technologies Used

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Playwright
- Browser localStorage
- Visual Studio Code

## System Features

### Task Dashboard

- Displays the total number of tasks.
- Shows the number of pending tasks.
- Displays tasks currently in progress.
- Shows the number of completed tasks.
- Automatically updates statistics when tasks change.

### Task Creation

- Allows users to create new tasks.
- Accepts task titles and descriptions.
- Supports Low, Medium, and High priority levels.
- Allows users to select a due date.
- Supports Pending, In Progress, and Completed statuses.
- Validates required task information.

### Task Management

- Displays saved tasks.
- Allows users to edit existing tasks.
- Supports deleting tasks.
- Allows task status updates.
- Searches tasks by title.
- Filters tasks according to status.

### Data Storage

- Uses browser localStorage to store task records.
- Preserves records after refreshing the browser.
- Allows task information to be updated and deleted.
- Prepared for future backend API integration.

## Installation Guide

1. Install Node.js on your computer.
2. Download or extract the project folder.
3. Open the `frontend` folder in Visual Studio Code.
4. Open **Terminal → New Terminal**.
5. Install the project dependencies:

```powershell
npm.cmd install
```

6. Start the React development server:

```powershell
npm.cmd run dev
```

7. Open the local URL displayed by Vite, usually http://localhost:5173.

The port may be different if another application is already using port 5173.

## Smoke Testing

The project uses Playwright to perform automated testing of essential frontend features.

Install the required Chromium browser:

```powershell
npx.cmd playwright install chromium
```

Run the automated smoke tests:

```powershell
npx.cmd playwright test
```

Generate an HTML test report:

```powershell
npx.cmd playwright test --reporter=html
```

Open the HTML report:

```powershell
npx.cmd playwright show-report
```

## Verified Smoke Test Results

**Test Date:** October 10, 2026

| Test Case | Result |
|---|---|
| Dashboard loads | PASSED |
| User can add a task | PASSED |
| Task persists after refresh | PASSED |
| User can search tasks | PASSED |
| User can update task status | PASSED |
| User can edit a task | PASSED |
| User can delete a task | PASSED |
| User can filter tasks by status | PASSED |
| Task title is required | PASSED |

**Total Tests:** 9  
**Passed:** 9  
**Failed:** 0  
**Execution Time:** 4.7 seconds

All nine automated frontend smoke tests passed successfully.

## Code Quality and Production Build

The frontend was checked using Oxlint and the Vite production build command.

### Lint Results

```powershell
npm.cmd run lint
```

**Verified Results:**

- Errors: 0
- Warnings: 0
- Status: PASSED

### Production Build

```powershell
npm.cmd run build
```

**Verified Results:**

- Build Status: SUCCESSFUL
- Modules Transformed: 21
- Build Time: 164 milliseconds

To preview the production build:

```powershell
npm.cmd run preview
```

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── TaskForm.jsx
│   │   └── TaskList.jsx
│   ├── services/
│   │   └── taskService.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── tests/
│   └── smoke.spec.js
├── docs/
│   └── TECHNICAL_DOCUMENTATION.md
├── index.html
├── playwright.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Backend Integration

The frontend currently operates independently using browser localStorage.

A backend project is being developed separately by another team member. Integration with task-related backend endpoints has not yet been completed.

Once the appropriate backend API becomes available, the task service can be updated to communicate with the API and store task records in a database.

## Current Limitations

- Backend API integration is pending.
- No user authentication system.
- Task records are stored in the current browser only.
- No synchronization between devices.
- No task assignment to multiple users.
- Production deployment has not been completed.

## Future Improvements

- Connect the frontend to a backend REST API.
- Store tasks in a database.
- Add user authentication and authorization.
- Support task assignment to team members.
- Implement task reminders and notifications.
- Add downloadable task reports.
- Improve dashboard analytics.
- Conduct backend integration and security testing.

## Project Status

| Deliverable | Status |
|---|---|
| Frontend Module | Implemented |
| Task Dashboard | Implemented |
| Task Creation and Editing | Implemented |
| Task Search and Filtering | Implemented |
| Task Status Management | Implemented |
| Automated Smoke Testing | 9/9 Passed |
| Lint Check | 0 Errors, 0 Warnings |
| Production Build | Successful |
| README Documentation | Updated |
| Technical Documentation | Updated |
| Backend Integration | Pending |
| Production Deployment | Pending |

## Conclusion

The Task Management System provides an organized interface for creating, updating, and tracking tasks.

Its main frontend features have been implemented and verified through nine successful Playwright smoke tests. The application also passed its lint check without errors or warnings and completed a successful production build.

The frontend is ready for the next development stage, including backend integration, additional system testing, and deployment.