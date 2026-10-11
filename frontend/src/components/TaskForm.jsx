
import { useState } from "react"

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  status: "Pending",
}

function TaskForm({ onSave, editingTask, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!editingTask) return { ...emptyForm }

    return {
      title: editingTask.title || "",
      description: editingTask.description || "",
      priority: editingTask.priority || "Medium",
      dueDate: editingTask.due_date || editingTask.dueDate || "",
      status: editingTask.status || "Pending",
    }
  })

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      alert("Please enter a task title.")
      return
    }

    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      status: form.status,
    })

    setForm({ ...emptyForm })
  }

  return (
    <section className="panel task-form-panel">
      <div className="form-heading">
        <div>
          <p className="form-eyebrow">
            {editingTask ? "KEEP MAKING PROGRESS" : "MAKE IT HAPPEN"}
          </p>
          <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
          <p className="form-description">
            {editingTask
              ? "Update the details of your task."
              : "Capture what's on your mind and make a plan."}
          </p>
        </div>

        <div className="form-heading-icon" aria-hidden="true">
          {editingTask ? "✎" : "+"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        <label>
          Task Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="What do you need to do?"
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add some details (optional)"
            rows={3}
          />
        </label>

        <div className="form-grid">
          <label>
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            {editingTask ? "✓ Save Changes" : "+ Add Task"}
          </button>

          {editingTask && (
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default TaskForm
