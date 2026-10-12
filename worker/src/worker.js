
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 60000);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function checkOverdueTasks() {
  const result = await pool.query(`
    SELECT id, title, due_date, status
    FROM tasks
    WHERE due_date IS NOT NULL
      AND due_date <> ''
      AND due_date < CURRENT_DATE::text
      AND status <> 'Completed'
    ORDER BY due_date ASC
  `);

  console.log(
    `[${new Date().toISOString()}] Overdue tasks found: ${result.rowCount}`
  );

  for (const task of result.rows) {
    console.log(
      `Overdue task: #${task.id} - ${task.title} (due: ${task.due_date})`
    );
  }
}

async function startWorker() {
  console.log("MyTasks background worker starting.");

  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connection successful.");

    await checkOverdueTasks();

    setInterval(async () => {
      try {
        await checkOverdueTasks();
      } catch (error) {
        console.error("Overdue task check failed:", error.message);
      }
    }, intervalMs);
  } catch (error) {
    console.error("Worker startup failed:", error.message);
    await pool.end();
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Worker shutting down.");
  await pool.end();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startWorker();
