
function Dashboard({ tasks }) {
  const total = tasks.length

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length

  // A task is overdue if its due date has passed
  // and it is not completed.
  const today = new Date().toISOString().slice(0, 10)

  const overdue = tasks.filter(
    (task) =>
      task.due_date &&
      task.due_date < today &&
      task.status !== "Completed"
  ).length

  return (
    <section className="dashboard">
      <div className="stat-card">
        <span>Total Tasks</span>
        <strong>{total}</strong>
      </div>

      <div className="stat-card">
        <span>Pending</span>
        <strong>{pending}</strong>
      </div>

      <div className="stat-card">
        <span>In Progress</span>
        <strong>{inProgress}</strong>
      </div>

      <div className="stat-card">
        <span>Completed</span>
        <strong>{completed}</strong>
      </div>

      <div className="stat-card">
        <span>Overdue</span>
        <strong>{overdue}</strong>
      </div>
    </section>
  )
}

export default Dashboard
