const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { isValidTransition } = require("../utils/statustTransition");
const {
  isValidPriority,
  isValidDate,
  isValidInteger,
  isValidTitle,
} = require("../utils/validations");
const { broadcast } = require("../realtime/sse");

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Tasks route working" });
});

/**
 * CREATE TASK (top-level or sub-task)
 */
router.post("/", async (req, res) => {
  const {
    title,
    description,
    priority,
    assignee_id,
    created_by,
    parent_task_id,
    due_date
  } = req.body; 
   

  if (!title || !priority || created_by === undefined) {
    return res.status(400).json({
      error: "title, priority, and created_by are required"
    });
  }

  if (!isValidTitle(title)) {
    return res.status(400).json({
      error: "title must be at least 3 characters"
    });
  }

  if (!isValidPriority(priority)) {
    return res.status(400).json({
      error: "priority must be one of: LOW, MEDIUM, HIGH, CRITICAL"
    });
  }

  if (!isValidInteger(created_by)) {
    return res.status(400).json({
      error: "created_by must be an integer"
    });
  }

  if (assignee_id !== undefined && assignee_id !== null && !isValidInteger(assignee_id)) {
    return res.status(400).json({
      error: "assignee_id must be an integer"
    });
  }

  if (parent_task_id !== undefined && parent_task_id !== null && !isValidInteger(parent_task_id)) {
    return res.status(400).json({
      error: "parent_task_id must be an integer"
    });
  }

  if (due_date !== undefined && due_date !== null && !isValidDate(due_date)) {
    return res.status(400).json({
      error: "due_date must be in YYYY-MM-DD format"
    });
  }

  const priorityUpper = priority.toUpperCase();

  try {
    const result = await dbRun(
      `
        INSERT INTO tasks
        (title, description, status, priority, assignee_id, created_by, parent_task_id)
        VALUES (?, ?, 'TODO', ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        priorityUpper,
        assignee_id || null,
        created_by,
        parent_task_id || null,
      ]
    );

    res.status(201).json({
      success: true,
      task_id: result.lastID,
    });
    broadcast("task.created", { task_id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE TASK STATUS (WITH VALIDATION + HISTORY LOGGING)
 */
router.patch("/:id/status", async (req, res) => {
  const taskId = req.params.id;
  const { new_status, changed_by } = req.body;

  if (!new_status || !changed_by) {
    return res.status(400).json({
      error: "new_status and changed_by are required"
    });
  }

  try {
    const task = await dbGet("SELECT status FROM tasks WHERE id = ?", [taskId]);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const oldStatus = task.status;

    if (!isValidTransition(oldStatus, new_status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${oldStatus} to ${new_status}`,
      });
    }

    await dbRun("UPDATE tasks SET status = ? WHERE id = ?", [
      new_status,
      taskId,
    ]);

    await dbRun(
      `
        INSERT INTO task_history
        (task_id, field_name, old_value, new_value, changed_by)
        VALUES (?, 'status', ?, ?, ?)
      `,
      [taskId, oldStatus, new_status, changed_by]
    );

    res.json({
      success: true,
      message: `Status updated from ${oldStatus} to ${new_status}`,
    });
    broadcast("task.status_updated", {
      task_id: Number(taskId),
      old_status: oldStatus,
      new_status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:id/subtasks", async (req, res) => {
  const taskId = req.params.id;

  try {
    const subtasks = await dbAll(
      `
        SELECT *
        FROM subtasks
        WHERE task_id = ?
      `,
      [taskId]
    );
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CREATE SUBTASK
 */
router.post("/:id/subtasks", async (req, res) => {
  const taskId = req.params.id;
  const { title } = req.body;

  if (!isValidTitle(title)) {
    return res.status(400).json({
      error: "title must be at least 3 characters",
    });
  }

  try {
    const task = await dbGet("SELECT id FROM tasks WHERE id = ?", [taskId]);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const result = await dbRun(
      "INSERT INTO subtasks (title, task_id) VALUES (?, ?)",
      [title, taskId]
    );

    res.status(201).json({
      success: true,
      subtask_id: result.lastID,
    });
    broadcast("subtask.created", {
      task_id: Number(taskId),
      subtask_id: result.lastID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE SUBTASK
 */
router.patch("/subtasks/:subtaskId", async (req, res) => {
  const subtaskId = req.params.subtaskId;
  const { title } = req.body;

  if (!isValidTitle(title)) {
    return res.status(400).json({
      error: "title must be at least 3 characters",
    });
  }

  try {
    const result = await dbRun(
      "UPDATE subtasks SET title = ? WHERE id = ?",
      [title, subtaskId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    res.json({ success: true });
    broadcast("subtask.updated", { subtask_id: Number(subtaskId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE SUBTASK
 */
router.delete("/subtasks/:subtaskId", async (req, res) => {
  const subtaskId = req.params.subtaskId;

  try {
    const result = await dbRun("DELETE FROM subtasks WHERE id = ?", [
      subtaskId,
    ]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    res.json({ success: true });
    broadcast("subtask.deleted", { subtask_id: Number(subtaskId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE TASK PARENT (convert to sub-task)
 */
router.patch("/:id/parent", async (req, res) => {
  const taskId = req.params.id;
  const { parent_task_id } = req.body;

  if (!parent_task_id) {
    return res.status(400).json({
      error: "parent_task_id is required"
    });
  }

  // prevent self-parenting
  if (Number(taskId) === Number(parent_task_id)) {
    return res.status(400).json({
      error: "Task cannot be its own parent"
    });
  }

  try {
    const result = await dbRun(
      `
        UPDATE tasks
        SET parent_task_id = ?
        WHERE id = ?
      `,
      [parent_task_id, taskId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      success: true,
      message: `Task ${taskId} is now a sub-task of ${parent_task_id}`,
    });
    broadcast("task.parent_updated", {
      task_id: Number(taskId),
      parent_task_id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET TASK HISTORY (AUDIT TRAIL)
 */
router.get("/:id/history", async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await dbGet("SELECT id, status FROM tasks WHERE id = ?", [
      taskId,
    ]);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const history = await dbAll(
      `
        SELECT
          id,
          field_name,
          old_value,
          new_value,
          changed_by,
          changed_at
        FROM task_history
        WHERE task_id = ?
        ORDER BY changed_at ASC
      `,
      [taskId]
    );

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all tasks
// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await dbAll("SELECT * FROM tasks");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET TASK BY ID
 */
router.get("/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await dbGet("SELECT * FROM tasks WHERE id = ?", [taskId]);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    const subtasks = await dbAll(
      "SELECT * FROM subtasks WHERE task_id = ?",
      [taskId]
    );
    task.subtasks = subtasks;
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET top-level tasks only
router.get("/top-level/all", async (req, res) => {
  try {
    const tasks = await dbAll(
      `
        SELECT * FROM tasks
        WHERE parent_task_id IS NULL
        ORDER BY created_at DESC
      `
    );

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/count", async (req, res) => {
  try {
    const result = await dbGet("SELECT COUNT(*) AS total FROM tasks");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE TASK FIELDS
 */
router.patch("/:id", async (req, res) => {
  const taskId = req.params.id;
  const {
    title,
    description,
    priority,
    assignee_id,
    due_date,
    parent_task_id,
  } = req.body;

  if (title !== undefined && !isValidTitle(title)) {
    return res.status(400).json({
      error: "title must be at least 3 characters",
    });
  }

  if (priority && !isValidPriority(priority)) {
    return res.status(400).json({
      error: "priority must be one of: LOW, MEDIUM, HIGH, CRITICAL",
    });
  }

  if (
    assignee_id !== undefined &&
    assignee_id !== null &&
    !isValidInteger(assignee_id)
  ) {
    return res.status(400).json({
      error: "assignee_id must be an integer",
    });
  }

  if (due_date !== undefined && due_date !== null && !isValidDate(due_date)) {
    return res.status(400).json({
      error: "due_date must be in YYYY-MM-DD format",
    });
  }

  if (parent_task_id && Number(taskId) === Number(parent_task_id)) {
    return res.status(400).json({
      error: "Task cannot be its own parent",
    });
  }

  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push("title = ?");
    params.push(title);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    params.push(description);
  }
  if (priority !== undefined) {
    updates.push("priority = ?");
    params.push(priority.toUpperCase());
  }
  if (assignee_id !== undefined) {
    updates.push("assignee_id = ?");
    params.push(assignee_id);
  }
  if (due_date !== undefined) {
    updates.push("due_date = ?");
    params.push(due_date);
  }
  if (parent_task_id !== undefined) {
    updates.push("parent_task_id = ?");
    params.push(parent_task_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  params.push(taskId);

  try {
    const result = await dbRun(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
    broadcast("task.updated", { task_id: Number(taskId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE TASK
 */
router.delete("/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const result = await dbRun("DELETE FROM tasks WHERE id = ?", [taskId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ success: true });
    broadcast("task.deleted", { task_id: Number(taskId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
