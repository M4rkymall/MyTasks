
const { Pool } = require("pg");

const databaseUrl = process.env.TEST_DATABASE_URL;

const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres("PostgreSQL Integration", () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 2,
    });

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
    `);
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  test("connects to PostgreSQL and reads the tasks table", async () => {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS total FROM tasks"
    );

    expect(result.rows[0].total).toBeGreaterThanOrEqual(0);
  });

  test("inserts and reads a task without changing existing tasks", async () => {
    const title = `Jest PostgreSQL Test ${Date.now()}`;
    let insertedId;

    try {
      const inserted = await pool.query(
        `INSERT INTO tasks (title, description, status, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [title, "Temporary integration test", "Pending", "Low"]
      );

      insertedId = inserted.rows[0].id;

      const found = await pool.query(
        "SELECT title, status, priority FROM tasks WHERE id = $1",
        [insertedId]
      );

      expect(found.rows).toHaveLength(1);
      expect(found.rows[0]).toMatchObject({
        title,
        status: "Pending",
        priority: "Low",
      });
    } finally {
      if (insertedId !== undefined) {
        await pool.query("DELETE FROM tasks WHERE id = $1", [insertedId]);
      }
    }
  });
});
