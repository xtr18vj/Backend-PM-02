const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * ASSIGN TASK TO USER
 * PATCH /assign/:taskId
 */
router.patch("/:taskId", (req, res) => {
  const { taskId } = req.params;
  const { assignee_id, changed_by } = req.body;

  if (!assignee_id || !changed_by) {
    return res.status(400).json({ error: "assignee_id and changed_by are required" });
  }

  // 1. Get current assignment for history
  const task = db.prepare("SELECT assignee_id FROM tasks WHERE id = ?").get(taskId);
  
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const oldAssignee = task.assignee_id;

  // 2. Update the task
  db.prepare("UPDATE tasks SET assignee_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(assignee_id, taskId);

  // 3. Log to history (field_name 'assignee_id' is allowed in your schema)
  db.prepare(`
    INSERT INTO task_history (task_id, field_name, old_value, new_value, changed_by)
    VALUES (?, 'assignee_id', ?, ?, ?)
  `).run(taskId, String(oldAssignee), String(assignee_id), changed_by);

  res.json({
    success: true,
    message: `Task ${taskId} assigned to user ${assignee_id}`
  });
});

module.exports = router;