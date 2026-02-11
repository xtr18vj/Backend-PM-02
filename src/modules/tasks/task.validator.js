const { STATUS, PRIORITY } = require("../../utils/constants");

function validateTaskCreate(payload) {
  if (!payload || typeof payload.title !== "string" || !payload.title.trim()) {
    return "title is required";
  }
  if (payload.status && !STATUS.includes(payload.status)) {
    return `invalid status. allowed: ${STATUS.join(", ")}`;
  }
  if (payload.priority && !PRIORITY.includes(payload.priority)) {
    return `invalid priority. allowed: ${PRIORITY.join(", ")}`;
  }
  return null;
}

function validateTaskUpdate(payload) {
  if (!payload || Object.keys(payload).length === 0) {
    return "payload is required";
  }
  if (payload.status && !STATUS.includes(payload.status)) {
    return `invalid status. allowed: ${STATUS.join(", ")}`;
  }
  if (payload.priority && !PRIORITY.includes(payload.priority)) {
    return `invalid priority. allowed: ${PRIORITY.join(", ")}`;
  }
  return null;
}

function validateSubtaskCreate(payload) {
  return validateTaskCreate(payload);
}

function validateSubtaskUpdate(payload) {
  return validateTaskUpdate(payload);
}

module.exports = {
  validateTaskCreate,
  validateTaskUpdate,
  validateSubtaskCreate,
  validateSubtaskUpdate,
};
