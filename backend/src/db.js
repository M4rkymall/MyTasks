
const path = require("path")
const fs = require("fs")
const sqlite3 = require("sqlite3").verbose()

const isPostgres = Boolean(process.env.DATABASE_URL)

let db
let pool

if (isPostgres) {
  const { Pool } = require("pg")

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true"
      ? { rejectUnauthorized: true }
      : false
  })
} else {
  const dbFile = path.resolve(
    process.env.DB_FILE || path.join(__dirname, "../db/tasks.db")
  )

  fs.mkdirSync(path.dirname(dbFile), { recursive: true })
  db = new sqlite3.Database(dbFile)
}

function formatSql(sql) {
  if (!isPostgres) return sql

  let index = 0
  return sql.replace(/\?/g, () => `$${++index}`)
}

function run(sql, params = []) {
  if (isPostgres) {
    return pool.query(formatSql(sql), params).then(result => ({
      id: result.rows[0]?.id,
      changes: result.rowCount
    }))
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

function get(sql, params = []) {
  if (isPostgres) {
    return pool.query(formatSql(sql), params).then(result => result.rows[0])
  }

  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) =>
      err ? reject(err) : resolve(row)
    )
  })
}

function all(sql, params = []) {
  if (isPostgres) {
    return pool.query(formatSql(sql), params).then(result => result.rows)
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) =>
      err ? reject(err) : resolve(rows)
    )
  })
}

async function initializeDatabase() {
  if (isPostgres) {
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
    return
  }

  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pending'
        CHECK(status IN ('Pending', 'In Progress', 'Completed')),
      priority TEXT NOT NULL DEFAULT 'Medium'
        CHECK(priority IN ('Low', 'Medium', 'High')),
      assigned_to TEXT,
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

module.exports = {
  db,
  pool,
  isPostgres,
  run,
  get,
  all,
  initializeDatabase
}
