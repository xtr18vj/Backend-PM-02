const allowedTransitions = {
  TODO: ["IN_PROGRESS", "BLOCKED", "CANCELLED"],
  IN_PROGRESS: ["BLOCKED", "COMPLETED", "CANCELLED"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
};

function isValidTransition(oldStatus, newStatus) {
  if (oldStatus === newStatus) {
    return false;
  }

  const allowed = allowedTransitions[oldStatus] || [];
  return allowed.includes(newStatus);
}

module.exports = {
  isValidTransition
};
