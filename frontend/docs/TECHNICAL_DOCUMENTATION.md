# TECHNICAL DOCUMENTATION
## Task Management System

### 1. Introduction

The Task Management System is a web-based application developed using React.js to help users organize, manage, and monitor their daily tasks.

The system provides a user-friendly interface for creating tasks, editing task information, setting priorities and deadlines, updating task statuses, and tracking progress through a dashboard.

The application currently uses browser localStorage to store task records while backend integration is pending.

### 2. Project Objectives

The objectives of the Task Management System are:

- To simplify the process of creating and organizing tasks.
- To help users monitor their task progress.
- To allow users to set task priorities and deadlines.
- To provide a dashboard displaying task statistics.
- To support task creation, editing, updating, and deletion.
- To allow searching and filtering of task records.
- To validate required task information.
- To prepare the frontend for future backend API integration.

### 3. Technologies Used

**React.js** – Builds the user interface and reusable components.

**Vite** – Provides the frontend development environment and production build tools.

**JavaScript** – Handles application logic, task management, and user interactions.

**HTML5** – Provides the structure of the web application.

**CSS3** – Controls the design, layout, and responsiveness of the interface.

**Playwright** – Performs automated frontend smoke testing.

**localStorage** – Stores task records temporarily in the user's browser.

**Visual Studio Code** – Serves as the development environment.

### 4. System Architecture

The current frontend follows a component-based architecture using React.

**Current System Flow:**

```text
User
 |
 v
React Application
 |
 +-- Dashboard.jsx
 |
 +-- TaskForm.jsx
 |
 +-- TaskList.jsx
 |
 v
taskService.js
 |
 v
Browser localStorage
```

**Planned System Flow:**

```text
React Frontend
 |
 v
Backend REST API
 |
 v
Database
```

The frontend currently operates independently while task-related backend integration is pending.

### 5. Frontend Components

#### 5.1 App.jsx

App.jsx serves as the main application component.

**Responsibilities:**

- Manages the task state.
- Connects the frontend components.
- Loads task records.
- Handles task creation and editing.
- Handles task deletion.
- Updates task statuses.
- Refreshes task information when records change.

#### 5.2 Dashboard.jsx

The Dashboard component displays important task statistics.

**Features:**

- Total number of tasks.
- Number of pending tasks.
- Number of tasks in progress.
- Number of completed tasks.

The displayed statistics automatically update whenever task records change.

#### 5.3 TaskForm.jsx

The TaskForm component allows users to create new tasks and edit existing ones.

**Form Fields:**

- Task title
- Task description
- Priority (Low, Medium, High)
- Due date
- Status (Pending, In Progress, Completed)

The form automatically changes between Add Task and Edit Task modes depending on the selected operation.

#### 5.4 TaskList.jsx

The TaskList component displays saved task records.

**Features:**

- Displays task titles and descriptions.
- Shows task priorities and due dates.
- Allows searching for tasks by title.
- Filters tasks by status.
- Allows editing of task records.
- Allows updating task statuses.
- Supports deleting tasks with confirmation.

#### 5.5 taskService.js

The task service handles task storage and retrieval.

**Functions:**

- `getTasks()` – Retrieves saved tasks.
- `addTask()` – Creates and saves a new task.
- `updateTask()` – Updates an existing task.
- `deleteTask()` – Removes a task.

The service currently uses browser localStorage.

It will be updated to communicate with the backend REST API when compatible endpoints become available.

### 6. Form Validation

The task form includes validation to prevent incomplete submissions.

**Validation Rules:**

1. Task title is required.
2. Task title cannot contain only spaces.
3. Priority must be selected from the available options.
4. Task status must be selected from the available options.
5. Description and due date are optional.
6. Empty task titles cannot be submitted.

### 7. Data Management

Task records are currently stored using browser localStorage.

**Each task includes:**

- Unique task ID
- Task title
- Description
- Priority
- Due date
- Status
- Creation timestamp

Records remain available after refreshing the browser.

However, localStorage does not synchronize data between different browsers or devices.

### 8. Quality Assurance and Smoke Testing

Automated smoke testing was performed using Playwright to verify the main frontend features.

**Testing Date:** October 10, 2026

| Test Case | Result |
|---|---|
| 1. Dashboard loads | PASSED |
| 2. User can add a task | PASSED |
| 3. Task persists after refresh | PASSED |
| 4. User can search tasks | PASSED |
| 5. User can update task status | PASSED |
| 6. User can edit a task | PASSED |
| 7. User can delete a task | PASSED |
| 8. User can filter tasks by status | PASSED |
| 9. Task title is required | PASSED |

**Final Smoke Test Results:**

- Total Tests: 9
- Passed: 9
- Failed: 0
- Execution Time: 4.7 seconds

**Code Quality Check:**

- Lint Errors: 0
- Lint Warnings: 0

**Production Build:**

- Status: SUCCESSFUL
- Build Tool: Vite
- Build Time: 164 milliseconds

All nine frontend smoke tests passed successfully.

These results verify the tested frontend functionality using browser-based storage. Backend integration testing remains pending.

### 9. Testing Procedure

1. Open the frontend folder in Visual Studio Code.
2. Open the integrated terminal.
3. Install project dependencies.
4. Install the Playwright Chromium browser.
5. Run the automated smoke tests.
6. Review the test results.
7. Generate and open the HTML report.
8. Capture screenshots for documentation.
9. Run the lint check.
10. Generate the production build.

**Commands:**

```powershell
npm.cmd install
npx.cmd playwright install chromium
npx.cmd playwright test
npx.cmd playwright show-report
npm.cmd run lint
npm.cmd run build
npm.cmd run preview
```

### 10. Current Limitations

- The frontend is not yet connected to a task-related backend API.
- Task records are stored in browser localStorage.
- Data is not synchronized across devices.
- User authentication is not implemented.
- Task assignment to different users is not implemented.
- Full backend integration testing is pending.
- Production deployment has not been completed.

### 11. Future Improvements

- Connect the frontend to the backend REST API.
- Store task records in a database.
- Implement user authentication.
- Add task assignment for team members.
- Add task notifications and reminders.
- Add downloadable task reports.
- Improve task progress analytics.
- Conduct full integration and security testing.

### 12. Conclusion

The Task Management System frontend provides an organized and user-friendly interface for creating, managing, and tracking tasks.

Its main frontend features have been implemented and verified through nine successful automated smoke tests. The code quality check also completed with zero warnings and zero errors, and the production build was successful.

The system is ready for the next development stage, which involves backend integration, additional testing, and deployment.