
import { useEffect, useState } from "react"
import TaskForm from "./components/TaskForm"
import TaskList from "./components/TaskList"
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "./services/taskService"
import "./App.css"

const navigation = [
  { id: "dashboard", label: "My Day", icon: "☀️" },
  { id: "tasks", label: "All Tasks", icon: "📋" },
  { id: "upcoming", label: "Upcoming", icon: "📅" },
  { id: "completed", label: "Completed", icon: "✓" },
]

function App() {
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [selectedFocus, setSelectedFocus] = useState(null)

  async function refreshTasks() {
    try {
      setError("")
      setTasks(await getTasks())
    } catch (err) {
      setError(`${err.message}. Make sure the backend is running.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [])

  async function handleSave(taskData) {
    try {
      setError("")

      if (editingTask) {
        await updateTask(editingTask.id, taskData)
        setEditingTask(null)
      } else {
        await addTask(taskData)
      }

      await refreshTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      setError("")
      await deleteTask(id)

      if (String(editingTask?.id) === String(id)) {
        setEditingTask(null)
      }

      await refreshTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setError("")
      await updateTask(id, { status })
      await refreshTasks()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const now = new Date()

  const todayString = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-")

  const activeTasks = tasks.filter(
    (task) => task.status !== "Completed"
  )

  const todayTasks = tasks.filter((task) => {
    const dueDate = task.due_date || task.dueDate
    return dueDate === todayString
  })

  const completedTodayDueTasks = todayTasks.filter(
    (task) => task.status === "Completed"
  ).length

  const dailyProgress = todayTasks.length
    ? Math.round(
        (completedTodayDueTasks / todayTasks.length) * 100
      )
    : 0

  const overdueTasks = activeTasks
    .filter((task) => {
      const dueDate = task.due_date || task.dueDate
      return dueDate && dueDate < todayString
    })
    .sort((a, b) => {
      const dateA = a.due_date || a.dueDate
      const dateB = b.due_date || b.dueDate
      return dateA.localeCompare(dateB)
    })

  const dueTodayTasks = activeTasks.filter((task) => {
    const dueDate = task.due_date || task.dueDate
    return dueDate === todayString
  })

  const upcomingTasks = activeTasks.filter((task) => {
    const dueDate = task.due_date || task.dueDate
    return dueDate && dueDate > todayString
  })

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  )

  const pageTitles = {
    dashboard: {
      title: "My Day",
      subtitle: "A little progress goes a long way.",
    },
    tasks: {
      title: "All Tasks",
      subtitle: "Everything you need to remember, in one place.",
    },
    upcoming: {
      title: "Upcoming",
      subtitle: "Keep an eye on what's coming next.",
    },
    completed: {
      title: "Completed",
      subtitle: "Look back at what you've accomplished.",
    },
  }

  const page = pageTitles[activePage]

  function handleEdit(task) {
    setEditingTask(task)
    setActivePage("tasks")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleAddTask() {
    setEditingTask(null)
    setActivePage("dashboard")
    window.scrollTo({ top: 0, behavior: "smooth" })

    document
      .getElementById("task-form-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleNavigate(pageId) {
    setActivePage(pageId)
    setEditingTask(null)
    setSelectedFocus(null)
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <h2>MyTasks</h2>
            <p>PERSONAL WORKSPACE</p>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => handleNavigate(item.id)}
              aria-current={
                activePage === item.id ? "page" : undefined
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.id === "tasks" && (
                <span className="nav-count">{tasks.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>✦</span>
            <p>Small steps count. Keep moving forward.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            MyTasks <span>/</span> {page.title}
          </div>

          <div className="today-label">
            {now.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </header>

        <div className="page-content">
          <header className="page-heading">
            <div>
              <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddTask}
            >
              <span>＋</span> Add task
            </button>
          </header>

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          {loading ? (
            <p className="loading-message">
              Getting your tasks ready...
            </p>
          ) : (
            <>
              {activePage === "dashboard" && (
                <>
                  <section className="panel daily-progress-panel">
                    <div className="daily-progress-heading">
                      <div>
                        <p className="form-eyebrow">
                          DAILY PROGRESS
                        </p>
                        <h2>You're making progress.</h2>
                        <p>
                          {completedTodayDueTasks} of {todayTasks.length} due-today tasks completed
                        </p>
                      </div>

                      <div
                        className="daily-progress-percentage"
                        aria-label={`${dailyProgress}% completed`}
                      >
                        {dailyProgress}%
                      </div>
                    </div>

                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label="Today's task completion"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={dailyProgress}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${dailyProgress}%` }}
                      />
                    </div>

                    {todayTasks.length > 0 &&
                      completedTodayDueTasks === todayTasks.length && (
                        <p className="progress-complete-label">
                          ✓ All due-today tasks completed!
                        </p>
                      )}
                  </section>

                  <section className="focus-grid">
                    <button
                      type="button"
                      className={`focus-card today-focus ${
                        selectedFocus === "today" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedFocus(
                          selectedFocus === "today" ? null : "today"
                        )
                      }
                      aria-expanded={selectedFocus === "today"}
                    >
                      <div className="focus-card-top">
                        <span className="focus-card-icon">☀</span>
                        <span className="focus-card-count">
                          {dueTodayTasks.length}
                        </span>
                      </div>
                      <h2>Due Today</h2>
                      <p>Tasks with today's deadline</p>
                      <span className="focus-card-link">
                        {selectedFocus === "today" ? "Hide tasks ↑" : "View tasks →"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`focus-card overdue-focus ${
                        selectedFocus === "overdue" ? "selected" : ""
                      }`}
                      onClick={() =>
                        setSelectedFocus(
                          selectedFocus === "overdue" ? null : "overdue"
                        )
                      }
                      aria-expanded={selectedFocus === "overdue"}
                    >
                      <div className="focus-card-top">
                        <span className="focus-card-icon">◷</span>
                        <span className="focus-card-count">
                          {overdueTasks.length}
                        </span>
                      </div>
                      <h2>Overdue</h2>
                      <p>Past-due unfinished tasks</p>
                      <span className="focus-card-link">
                        {selectedFocus === "overdue" ? "Hide tasks ↑" : "View tasks →"}
                      </span>
                    </button>
                  </section>

                  {selectedFocus && (
                    <section className="panel focus-results">
                      <div className="task-list-heading">
                        <div>
                          <h2>
                            {selectedFocus === "today"
                              ? "Due Today"
                              : "Overdue Tasks"}
                          </h2>
                          <p className="task-list-subtitle">
                            {selectedFocus === "today"
                              ? "Your unfinished tasks for today."
                              : "Tasks that still need your attention."}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="focus-close"
                          onClick={() => setSelectedFocus(null)}
                          aria-label="Close task list"
                        >
                          ×
                        </button>
                      </div>

                      <TaskList
                        tasks={
                          selectedFocus === "today"
                            ? dueTodayTasks
                            : overdueTasks
                        }
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        hideHeading
                      />
                    </section>
                  )}

                  <section className="panel task-form-panel" id="task-form-panel">
                    <TaskForm
                      key={editingTask?.id ?? "new"}
                      editingTask={editingTask}
                      onSave={handleSave}
                      onCancel={() => setEditingTask(null)}
                    />
                  </section>
                </>
              )}

              {activePage === "tasks" && (
                <div className="content-grid">
                  <TaskForm
                    key={editingTask?.id ?? "new"}
                    editingTask={editingTask}
                    onSave={handleSave}
                    onCancel={() => setEditingTask(null)}
                  />

                  <TaskList
                    tasks={tasks}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}

              {activePage === "upcoming" && (
                <TaskList
                  tasks={upcomingTasks}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              )}

              {activePage === "completed" && (
                <TaskList
                  tasks={completedTasks}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
