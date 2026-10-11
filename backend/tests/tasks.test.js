const fs = require("fs")
const path = require("path")
const testDb = path.join(__dirname, "test.db")
try { fs.unlinkSync(testDb) } catch {}
process.env.DB_FILE = testDb
const request = require("supertest")
const app = require("../src/server")
const { initializeDatabase, db } = require("../src/db")

beforeAll(async () => { await initializeDatabase() })
afterAll(async () => {
  await new Promise((resolve, reject) => {
    db.close(err => err ? reject(err) : resolve())
  })
  try {
    fs.unlinkSync(testDb)
  } catch {}
})

describe("Task Management API", () => {
  test("health endpoint works", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
  })
  test("creates and lists a task", async () => {
    const created = await request(app).post("/api/tasks").send({ title: "Test task", priority: "High" })
    expect(created.status).toBe(201)
    expect(created.body.title).toBe("Test task")
    const list = await request(app).get("/api/tasks")
    expect(list.body.some(t => t.title === "Test task")).toBe(true)
  })
  test("updates task status", async () => {
    const created = await request(app).post("/api/tasks").send({ title: "Update me" })
    const updated = await request(app).put(`/api/tasks/${created.body.id}`).send({ status: "Completed" })
    expect(updated.status).toBe(200)
    expect(updated.body.status).toBe("Completed")
  })
  test("rejects task without title", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "   " })
    expect(res.status).toBe(400)
  })
  test("deletes a task", async () => {
    const created = await request(app).post("/api/tasks").send({ title: "Delete me" })
    const removed = await request(app).delete(`/api/tasks/${created.body.id}`)
    expect(removed.status).toBe(200)
  })
})
