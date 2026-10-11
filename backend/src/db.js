const path = require("path")
const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()

const dbFile = path.resolve(process.env.DB_FILE || path.join(__dirname, "../db/tasks.db"))
fs.mkdirSync(path.dirname(dbFile), { recursive: true })
const db = new sqlite3.Database(dbFile)

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({ id: this.lastID, changes: this.changes })
    })
  })
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)))
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)))
}
async function initializeDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High')),
    assigned_to TEXT,
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
}
module.exports = { db, run, get, all, initializeDatabase }
