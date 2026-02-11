const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, "..", "..", "database", "task.db");

let db;
let initPromise;

async function loadDb() {
  if (db) return db;

  if (!initPromise) {
    initPromise = initSqlJs().then((SQL) => {
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      let fileBuffer = null;
      if (fs.existsSync(DB_PATH)) {
        fileBuffer = fs.readFileSync(DB_PATH);
      }

      db = new SQL.Database(fileBuffer);

      const schemaPath = path.join(
        __dirname,
        "..",
        "..",
        "database",
        "schema.sql"
      );

      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      db.exec(schemaSql);

      return db;
    });
  }

  return initPromise;
}

function persistDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function sanitizeParams(params) {
  return params.map((v) => (v === undefined ? null : v));
}

async function run(sql, params = []) {
  const database = await loadDb();
  const stmt = database.prepare(sql);
  stmt.bind(sanitizeParams(params));

  try {
    stmt.step();
  } finally {
    stmt.free();
  }

  return {
    id: database.exec("SELECT last_insert_rowid() AS id")[0]?.values?.[0]?.[0],
    changes: database.getRowsModified(),
  };
}

async function get(sql, params = []) {
  const database = await loadDb();
  const stmt = database.prepare(sql);
  stmt.bind(sanitizeParams(params));
  const row = stmt.step() ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
}

async function all(sql, params = []) {
  const database = await loadDb();
  const stmt = database.prepare(sql);
  stmt.bind(sanitizeParams(params));
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

async function withTransaction(fn) {
  const database = await loadDb();
  try {
    database.exec("BEGIN TRANSACTION");
    const result = await fn();
    database.exec("COMMIT");
    persistDb();
    return result;
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}

async function close() {
  if (!db) return;
  persistDb();
  db.close();
  db = null;
}

module.exports = {
  run,
  get,
  all,
  withTransaction,
  close,
};