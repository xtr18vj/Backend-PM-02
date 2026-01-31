const db = require("./db");

const createProject = async (project) => {
  const query = `
    INSERT INTO projects 
    (name, description, status, priority, start_date, end_date, owner_id, manager_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const values = [
    project.name,
    project.description,
    project.status,
    project.priority,
    project.start_date,
    project.end_date,
    project.owner_id,
    project.manager_id
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getAllProjects = async () => {
  const result = await db.query("SELECT * FROM projects");
  return result.rows;
};

module.exports = { createProject, getAllProjects };


