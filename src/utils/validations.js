const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function isValidPriority(priority) {
  return priority && VALID_PRIORITIES.includes(priority.toUpperCase());
}

function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() + 1 === m &&
    date.getUTCDate() === d
  );
}






function isValidInteger(value) {
  return Number.isInteger(value);
}

function isValidTitle(title, minLength = 3) {
  return typeof title === "string" && title.trim().length >= minLength;
}

module.exports = {
  isValidPriority,
  isValidDate,
  isValidInteger,
  isValidTitle,
  VALID_PRIORITIES
};





