const express = require("express");
const router = express.Router();
const db = require("../db");
const { isValidPriority } = require("../utils/validators");

/**
 * GET tasks by specific priority
 * GET /priority/:level
 */
router.get("/:level", (req, res) => {
  const priorityLevel = req.params.level.toUpperCase();

  if (!isValidPriority(priorityLevel)) {
    return res.status(400).json({
      error: "Invalid priority level. Must be LOW, MEDIUM, HIGH, or CRITICAL",
    });
  }

  const tasks = db.prepare(`
    SELECT * FROM tasks 
    WHERE priority = ? 
    ORDER BY created_at DESC
  `).all(priorityLevel);

  res.json(tasks);
});

/**
 * UPDATE task priority
 * PATCH /priority/:id
 */
router.patch("/:id", (req, res) => {
  const taskId = req.params.id;
  const { new_priority, changed_by } = req.body;

  if (!new_priority || !changed_by) {
    return res.status(400).json({
      error: "new_priority and changed_by are required",
    });
  }

  const priorityUpper = new_priority.toUpperCase();

  if (!isValidPriority(priorityUpper)) {
    return res.status(400).json({
      error: "Invalid priority level",
    });
  }

  // 1. Get old priority for history logging
  const task = db.prepare("SELECT priority FROM tasks WHERE id = ?").get(taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const oldPriority = task.priority;

  // 2. Update the priority
  db.prepare("UPDATE tasks SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(priorityUpper, taskId);

  // 3. Log to history (matches your schema field_name check)
  db.prepare(`
    INSERT INTO task_history (task_id, field_name, old_value, new_value, changed_by)
    VALUES (?, 'priority', ?, ?, ?)
  `).run(taskId, oldPriority, priorityUpper, changed_by);

  res.json({
    success: true,
    message: `Priority updated from ${oldPriority} to ${priorityUpper}`,
  });
});

/**
 * GET priority statistics
 * GET /priority/stats/summary
 */
router.get("/stats/summary", (req, res) => {
  const stats = db.prepare(`
    SELECT priority, COUNT(*) as count 
    FROM tasks 
    GROUP BY priority
  `).all();
  
  res.json(stats);
});

module.exports = router;