const { run, get, all } = require("../../config/database");

/* TASKS */

async function listTasks() {
  return all("SELECT * FROM tasks ORDER BY id DESC");
}

async function getTaskById(id) {
  return get("SELECT * FROM tasks WHERE id = ?", [id]);
}

async function createTask(data) {
  const result = await run(
    `INSERT INTO tasks (title, description, status, priority, assignee, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.title,
      data.description,
      data.status,
      data.priority,
      data.assignee,
      data.due_date,
    ]
  );

  return getTaskById(result.id);
}

async function updateTask(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields.map(field => `${field} = ?`).join(", ");

  const sql = `UPDATE tasks SET ${setClause} WHERE id = ?`;

  await run(sql, [...values, id]);   // ✅ FIXED (use run)

  return getTaskById(id);
}



async function deleteTask(id) {
  await run("DELETE FROM tasks WHERE id = ?", [id]);
}

/* SUBTASKS */

async function createSubtask(taskId, data) {
  const result = await run(
    `INSERT INTO subtasks (task_id, title, description, status, priority, assignee, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      data.title,
      data.description,
      data.status,
      data.priority,
      data.assignee,
      data.due_date,
    ]
  );

  return get("SELECT * FROM subtasks WHERE id = ?", [result.id]);
}

async function listSubtasks(taskId) {
  return all(
    "SELECT * FROM subtasks WHERE task_id = ? ORDER BY id DESC",
    [taskId]
  );
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  listSubtasks,
};