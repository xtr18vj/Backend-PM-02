const pool = require("../config/db");

exports.createTask = async (req, res) => {
  const { title, priority, created_by } = req.body;

  if (!title || !priority || !created_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const result = await pool.query(
    `INSERT INTO tasks (title, priority, created_by)
     VALUES ($1, $2, $3) RETURNING id`,
    [title, priority.toUpperCase(), created_by]
  );

  res.status(201).json({
    success: true,
    task_id: result.rows[0].id,
  });
};

exports.getAllTasks = async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
  res.json(result.rows);
};