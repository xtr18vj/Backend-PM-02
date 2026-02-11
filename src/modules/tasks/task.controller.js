const service = require("./task.service");

function success(res, data, message, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

exports.listTasks = async (req, res, next) => {
  try {
    const tasks = await service.listAllTasks();
    return success(res, tasks, "Tasks fetched successfully");
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await service.getTask(req.params.id);
    return success(res, task, "Task fetched successfully");
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await service.createNewTask(req.body);
    return success(res, task, "Task created successfully", 201);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await service.updateExistingTask(
      req.params.id,
      req.body
    );
    return success(res, task, "Task updated successfully");
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await service.removeTask(req.params.id);
    return success(res, null, "Task deleted successfully", 204);
  } catch (err) {
    next(err);
  }
};
