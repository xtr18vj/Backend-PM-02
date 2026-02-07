PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    parent_task_id INTEGER NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (
        status IN ('TODO','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED')
    ),
    priority TEXT NOT NULL CHECK (
        priority IN ('LOW','MEDIUM','HIGH','CRITICAL')
    ),
    assignee_id INTEGER NULL,
    created_by INTEGER NOT NULL,
    due_date DATE,
    created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);


-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  task_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY,
    task_id INTEGER NOT NULL,
    field_name TEXT NOT NULL CHECK (field_name IN ('status','priority','assignee_id')),
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
