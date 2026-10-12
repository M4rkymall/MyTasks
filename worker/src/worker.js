const { Pool } = require("pg");
const http = require("node:http");

const databaseUrl = process.env.DATABASE_URL;
const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 60000);
const healthPort = Number(process.env.HEALTH_PORT || 3001);

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

let workerReady = false;
let shuttingDown = false;

const healthServer = http.createServer(async (req, res) => {
  if (req.method !== "GET" || req.url !== "/health") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "not_found" }));
    return;
  }

  try {
    await pool.query("SELECT 1");

    if (!workerReady || shuttingDown) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "not_ready" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "mytasks-worker",
        database: "connected",
      })
    );
  } catch (error) {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "unhealthy",
        database: "disconnected",
      })
    );
  }
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
    workerReady = true;

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
  if (shuttingDown) return;

  shuttingDown = true;
  workerReady = false;

  console.log("Worker shutting down.");

  healthServer.close(async () => {
    try {
      await pool.end();
    } finally {
      process.exit(0);
    }
  });
}

healthServer.listen(healthPort, "0.0.0.0", () => {
  console.log(`Worker health endpoint listening on port ${healthPort}.`);
  startWorker();
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
