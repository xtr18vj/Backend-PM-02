PRAGMA foreign_keys = ON;

-- Core tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assignee TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sub-tasks table (linked to tasks)
CREATE TABLE IF NOT EXISTS subtasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assignee TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task history table (auditing changes)
CREATE TABLE IF NOT EXISTS task_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  subtask_id INTEGER,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
  CHECK (
    (task_id IS NOT NULL AND subtask_id IS NULL)
    OR (task_id IS NULL AND subtask_id IS NOT NULL)
  )
);

-- Status transition rules
CREATE TABLE IF NOT EXISTS status_transitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_status TEXT NOT NULL CHECK (from_status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
  to_status TEXT NOT NULL CHECK (to_status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
  is_allowed INTEGER NOT NULL DEFAULT 1,
  UNIQUE (from_status, to_status)
);

-- Default transitions
INSERT OR IGNORE INTO status_transitions (from_status, to_status, is_allowed) VALUES
  ('TODO', 'IN_PROGRESS', 1),
  ('IN_PROGRESS', 'COMPLETED', 1),
  ('IN_PROGRESS', 'BLOCKED', 1),
  ('BLOCKED', 'IN_PROGRESS', 1),
  ('TODO', 'COMPLETED', 0),
  ('COMPLETED', 'IN_PROGRESS', 0),
  ('COMPLETED', 'TODO', 0),
  ('BLOCKED', 'COMPLETED', 0);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_history_task_id ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_history_subtask_id ON task_history(subtask_id);
