const express = require("express")
const { run, get, all } = require("../db")
const router = express.Router()
const statuses = ["Pending", "In Progress", "Completed"]
const priorities = ["Low", "Medium", "High"]

router.get("/", async (req, res) => {
  try {
    const clauses = [], params = []
    if (req.query.status) { clauses.push("status = ?"); params.push(req.query.status) }
    if (req.query.priority) { clauses.push("priority = ?"); params.push(req.query.priority) }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
    res.json(await all(`SELECT * FROM tasks ${where} ORDER BY id DESC`, params))
  } catch { res.status(500).json({ error: "Failed to fetch tasks" }) }
})
router.get("/:id", async (req, res) => {
  try {
    const task = await get("SELECT * FROM tasks WHERE id = ?", [req.params.id])
    if (!task) return res.status(404).json({ error: "Task not found" })
    res.json(task)
  } catch { res.status(500).json({ error: "Failed to fetch task" }) }
})
router.post("/", async (req, res) => {
  try {
    const { title, description = "", status = "Pending", priority = "Medium", assigned_to = null, due_date = null } = req.body
    if (typeof title !== "string" || !title.trim()) return res.status(400).json({ error: "title is required" })
    if (!statuses.includes(status)) return res.status(400).json({ error: "Invalid status" })
    if (!priorities.includes(priority)) return res.status(400).json({ error: "Invalid priority" })
    const result = await run(
      "INSERT INTO tasks (title, description, status, priority, assigned_to, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [title.trim(), description, status, priority, assigned_to, due_date]
    )
    res.status(201).json(await get("SELECT * FROM tasks WHERE id = ?", [result.id]))
  } catch { res.status(500).json({ error: "Failed to create task" }) }
})
router.put("/:id", async (req, res) => {
  try {
    const existing = await get("SELECT * FROM tasks WHERE id = ?", [req.params.id])
    if (!existing) return res.status(404).json({ error: "Task not found" })
    const title = req.body.title ?? existing.title
    const description = req.body.description ?? existing.description
    const status = req.body.status ?? existing.status
    const priority = req.body.priority ?? existing.priority
    const assigned_to = req.body.assigned_to ?? existing.assigned_to
    const due_date = req.body.due_date ?? existing.due_date
    if (typeof title !== "string" || !title.trim()) return res.status(400).json({ error: "title is required" })
    if (!statuses.includes(status)) return res.status(400).json({ error: "Invalid status" })
    if (!priorities.includes(priority)) return res.status(400).json({ error: "Invalid priority" })
    await run(
      "UPDATE tasks SET title=?, description=?, status=?, priority=?, assigned_to=?, due_date=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [title.trim(), description, status, priority, assigned_to, due_date, req.params.id]
    )
    res.json(await get("SELECT * FROM tasks WHERE id = ?", [req.params.id]))
  } catch { res.status(500).json({ error: "Failed to update task" }) }
})
router.delete("/:id", async (req, res) => {
  try {
    const result = await run("DELETE FROM tasks WHERE id = ?", [req.params.id])
    if (!result.changes) return res.status(404).json({ error: "Task not found" })
    res.json({ message: "Task deleted successfully" })
  } catch { res.status(500).json({ error: "Failed to delete task" }) }
})
module.exports = router
