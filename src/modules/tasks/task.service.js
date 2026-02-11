const {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  listSubtasks,
} = require("./task.model");

const { withTransaction } = require("../../config/database");

function isTransitionAllowed(from, to) {
  const rules = {
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED", "BLOCKED"],
    BLOCKED: ["IN_PROGRESS"],
    COMPLETED: [],
  };
  return rules[from]?.includes(to);
}

/* ================= TASKS ================= */

async function listAllTasks() {
  return listTasks();
}

async function getTask(id) {
  const task = await getTaskById(id);
  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }
  return task;
}

async function createNewTask(payload) {
  if (!payload.title) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }

  return withTransaction(async () => {
    return createTask({
      title: payload.title,
      description: payload.description || null,
      status: payload.status || "TODO",
      priority: payload.priority || "MEDIUM",
      assignee: payload.assignee || null,
      due_date: payload.due_date || null,
    });
  });
}

async function updateExistingTask(id, payload) {
  const existing = await getTask(id);

  const allowedFields = [
    "title",
    "description",
    "status",
    "priority",
    "assignee",
    "due_date",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields to update");
    err.status = 400;
    throw err;
  }

  if (
    updates.status &&
    !isTransitionAllowed(existing.status, updates.status)
  ) {
    const err = new Error("Invalid status transition");
    err.status = 400;
    throw err;
  }

  return withTransaction(async () => {
    return updateTask(id, updates);
  });
}

async function removeTask(id) {
  await getTask(id);

  return withTransaction(async () => {
    await deleteTask(id);
    return { success: true };
  });
}

/* ================= EXPORT ================= */
module.exports = {
  listAllTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  removeTask,
};
