const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

// CREATE SUBTASK
// POST /tasks/:parentId/subtasks
router.post("/", (req, res) => {
  const taskId = Number(req.params.parentId);
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  // Check if parent task exists
  const task = db
    .prepare("SELECT id FROM tasks WHERE id = ?")
    .get(taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const result = db
    .prepare(`
      INSERT INTO subtasks (title, task_id)
      VALUES (?, ?)
    `)
    .run(title, taskId);

  res.status(201).json({
    success: true,
    subtask_id: result.lastInsertRowid,
    task_id: taskId
  });
});

// GET SUBTASKS BY TASK ID
// GET /tasks/:parentId/subtasks
router.get("/", (req, res) => {
  const taskId = Number(req.params.parentId);

  const subtasks = db
    .prepare(`
      SELECT *
      FROM subtasks
      WHERE task_id = ?
      ORDER BY created_at ASC
    `)
    .all(taskId);

  res.json(subtasks);
});

module.exports = router;