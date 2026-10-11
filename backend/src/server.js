const express = require("express")
const { initializeDatabase } = require("./db")
const taskRoutes = require("./routes/tasks")
const app = express()
app.use(express.json())
app.get("/health", (_req, res) => res.json({ status: "ok", service: "task-management-api" }))
app.get("/", (_req, res) => res.json({ service: "Task Management API", endpoints: ["/health", "/api/tasks"] }))
app.use("/api/tasks", taskRoutes)
app.use((_req, res) => res.status(404).json({ error: "Route not found" }))
async function startServer() {
  await initializeDatabase()
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Task Management API running on port ${port}`))
}
if (require.main === module) startServer().catch(err => { console.error(err); process.exit(1) })
module.exports = app
