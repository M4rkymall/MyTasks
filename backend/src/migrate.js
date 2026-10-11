
const path = require("path")
const sqlite3 = require("sqlite3").verbose()
const { Pool } = require("pg")

const sqliteFile = path.resolve(
  process.env.DB_FILE || "/data/tasks.db"
)

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.")
  process.exit(1)
}

const source = new sqlite3.Database(
  sqliteFile,
  sqlite3.OPEN_READONLY
)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: true }
    : false
})

function getTasks() {
  return new Promise((resolve, reject) => {
    source.all("SELECT * FROM tasks ORDER BY id", (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

async function migrate() {
  try {
    const tasks = await getTasks()

    console.log(`Found ${tasks.length} tasks in SQLite.`)

    await pool.query("BEGIN")

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Pending'
          CHECK (status IN ('Pending', 'In Progress', 'Completed')),
        priority TEXT NOT NULL DEFAULT 'Medium'
          CHECK (priority IN ('Low', 'Medium', 'High')),
        assigned_to TEXT,
        due_date TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    for (const task of tasks) {
      await pool.query(
        `INSERT INTO tasks
          (id, title, description, status, priority, assigned_to,
           due_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          task.id,
          task.title,
          task.description,
          task.status,
          task.priority,
          task.assigned_to,
          task.due_date,
          task.created_at,
          task.updated_at
        ]
      )
    }

    await pool.query(`
      SELECT setval(
        pg_get_serial_sequence('tasks', 'id'),
        COALESCE((SELECT MAX(id) FROM tasks), 1),
        EXISTS (SELECT 1 FROM tasks)
      )
    `)

    await pool.query("COMMIT")

    const result = await pool.query(
      "SELECT id, title, status, priority FROM tasks ORDER BY id"
    )

    console.log("PostgreSQL tasks after migration:")
    console.table(result.rows)
    console.log("Migration completed successfully.")
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {})
    console.error("Migration failed:", err.message)
    process.exitCode = 1
  } finally {
    source.close()
    await pool.end()
  }
}

migrate()
