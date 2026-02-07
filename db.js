const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "src", "database", "schema.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite connection error:", err.message);
    return;
  }
  console.log("SQLite connected");
});

module.exports = db;
