
import { useState } from "react"

const statuses = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
]

function TaskList({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  hideHeading = false,
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [successMessage, setSuccessMessage] = useState("")

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-")

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = (task.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus =
      filter === "All" || task.status === filter

    const matchesPriority =
      priorityFilter === "All" ||
      (task.priority || "Medium") === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  async function handleStatusChange(task, status) {
    if (task.status === status) return

    try {
      setSuccessMessage("")
      await onStatusChange(task.id, status)

      if (status === "Completed") {
        setSuccessMessage(`Nice work! "${task.title}" completed.`)
      }
    } catch {
      // The parent component handles API errors.
    }
  }

  function formatDueDate(date) {
    if (!date) return "No due date"

    const [year, month, day] = date.split("-").map(Number)

    return new Date(year, month - 1, day).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    )
  }

  function getDaysRemaining(date) {
    if (!date) return ""

    const [year, month, day] = date.split("-").map(Number)
    const due = new Date(year, month - 1, day)
    const current = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    return Math.round((due - current) / 86400000)
  }

  return (
    <section className={hideHeading ? "task-list-embedded" : "panel"}>
      {!hideHeading && (
        <div className="task-list-heading">
          <div>
            <h2>Task List</h2>
            <p className="task-list-subtitle">
              Every small step moves you forward.
            </p>
          </div>

          <span className="task-total">{tasks.length} tasks</span>
        </div>
      )}

      {successMessage && (
        <div className="success-message" role="status">
          <span className="success-check">✓</span>
          {successMessage}
          <button
            type="button"
            className="dismiss-message"
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      <div className="filters">
        <input
          aria-label="Search tasks"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Filter by status"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <select
          aria-label="Filter by priority"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="empty-message">No tasks found.</p>
      ) : (
        <div className="task-list mockup-task-list">
          {filteredTasks.map((task) => {
            const dueDate = task.due_date || task.dueDate
            const isCompleted = task.status === "Completed"
            const isOverdue =
              dueDate && dueDate < today && !isCompleted
            const isDueToday =
              dueDate === today && !isCompleted
            const daysRemaining = getDaysRemaining(dueDate)

            return (
              <article
                className={`task-card mockup-task-card ${
                  isCompleted ? "task-card-completed" : ""
                } ${isOverdue ? "task-is-overdue" : ""}`}
                key={task.id}
              >
                <div className="mockup-task-icon">
                  {isCompleted ? (
                    <span>✓</span>
                  ) : isOverdue ? (
                    <span>!</span>
                  ) : (
                    <span>▤</span>
                  )}
                </div>

                <div className="mockup-task-content">
                  <div className="mockup-task-top">
                    <div className="mockup-task-title-area">
                      <span className="mockup-task-label">TASK</span>
                      <h3>{task.title}</h3>
                      <p className="mockup-task-description">
                        {task.description || "No description added yet."}
                      </p>
                    </div>

                    <span
                      className={`mockup-priority priority-${(
                        task.priority || "Medium"
                      ).toLowerCase()}`}
                    >
                      <span className="priority-dot" />
                      {task.priority || "Medium"} Priority
                    </span>
                  </div>

                  <div className="mockup-task-bottom">
                    <div
                      className={`mockup-due-date ${
                        isOverdue
                          ? "mockup-date-overdue"
                          : isDueToday
                            ? "mockup-date-today"
                            : isCompleted
                              ? "mockup-date-completed"
                              : ""
                      }`}
                    >
                      <span className="mockup-calendar" aria-hidden="true">
                        ▦
                      </span>

                      <div className="mockup-date-text">
                        <strong>
                          {formatDueDate(dueDate)}
                        </strong>

                        <span>
                          {!dueDate
                            ? "No deadline set"
                            : isOverdue
                              ? `${Math.abs(daysRemaining)} ${
                                  Math.abs(daysRemaining) === 1
                                    ? "day"
                                    : "days"
                                } overdue`
                              : isDueToday
                                ? "Due today"
                                : isCompleted
                                  ? "Task completed"
                                  : daysRemaining === 0
                                    ? "Due today"
                                    : `${daysRemaining} ${
                                        daysRemaining === 1
                                          ? "day"
                                          : "days"
                                      } left`}
                        </span>
                      </div>
                    </div>

                    <div className="mockup-status-area">
                      <span className="mockup-status-label">Status</span>

                      <div
                        className="mockup-status-options"
                        role="group"
                        aria-label={`Change status for ${task.title}`}
                      >
                        {statuses.map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            className={`mockup-status-button ${
                              status.value === "Pending"
                                ? "pending"
                                : status.value === "In Progress"
                                  ? "in-progress"
                                  : "completed"
                            } ${
                              task.status === status.value
                                ? "selected"
                                : ""
                            }`}
                            aria-pressed={task.status === status.value}
                            onClick={() =>
                              handleStatusChange(task, status.value)
                            }
                          >
                            {task.status === status.value && (
                              <span aria-hidden="true">✓ </span>
                            )}
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mockup-task-actions">
                      <button
                        type="button"
                        className="mockup-edit-button"
                        onClick={() => onEdit(task)}
                      >
                        <span aria-hidden="true">✎</span> Edit
                      </button>

                      <button
                        type="button"
                        className="mockup-delete-button"
                        onClick={() => {
                          if (window.confirm("Delete this task?")) {
                            onDelete(task.id)
                          }
                        }}
                      >
                        <span aria-hidden="true">⌫</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TaskList
