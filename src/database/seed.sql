PRAGMA foreign_keys = ON;

DELETE FROM task_history;
DELETE FROM subtasks;
DELETE FROM tasks;

INSERT INTO tasks (id, parent_task_id, title, description, status, priority, assignee_id, created_by, due_date)
VALUES
  (1, NULL, 'Set up project', 'Initialize repo and install dependencies', 'COMPLETED', 'MEDIUM', 2, 1, '2026-02-10'),
  (2, NULL, 'Implement tasks API', 'Create CRUD endpoints for tasks', 'IN_PROGRESS', 'HIGH', 3, 1, '2026-02-12'),
  (3, NULL, 'Write documentation', 'Add README and API usage', 'TODO', 'LOW', NULL, 1, '2026-02-15'),
  (4, 2, 'Add status history', 'Persist status changes for audit', 'TODO', 'MEDIUM', 3, 1, '2026-02-13');

INSERT INTO subtasks (title, task_id)
VALUES
  ('Draft endpoints list', 2),
  ('Add request validation', 2),
  ('Outline README sections', 3);

INSERT INTO task_history (task_id, field_name, old_value, new_value, changed_by)
VALUES
  (1, 'status', 'TODO', 'IN_PROGRESS', 1),
  (1, 'status', 'IN_PROGRESS', 'COMPLETED', 1),
  (2, 'status', 'TODO', 'IN_PROGRESS', 1);
