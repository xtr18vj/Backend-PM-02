const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let db = null;
let dbReady = null;

async function initializeDatabase() {

  const dbDir = path.dirname(config.database.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  try {
    if (fs.existsSync(config.database.path)) {
      const fileBuffer = fs.readFileSync(config.database.path);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (error) {
    console.log('Creating new database...');
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(config.database.path, buffer);
  }
}

async function getDb() {
  if (!db) {
    if (!dbReady) {
      dbReady = initializeDatabase();
    }
    await dbReady;
  }
  return db;
}

const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        db.run(sql, params);
        saveDatabase();
        return { changes: db.getRowsModified() };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all: (...params) => {
        const results = [];
        const stmt = db.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
    };
  },
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  },
  pragma: (pragma) => {
    db.run(`PRAGMA ${pragma}`);
  },
};

module.exports = {
  getDb,
  dbWrapper,
  saveDatabase,
  initializeDatabase,
};
