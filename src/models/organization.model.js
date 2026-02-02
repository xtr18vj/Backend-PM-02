const db = require("../../db");

const createOrganization = async (org) => {
  const result = await db.query(
    "INSERT INTO organizations (id, name) VALUES ($1, $2) RETURNING *",
    [org.id, org.name]
  );
  return result.rows[0];
};

const getOrganizations = async () => {
  const result = await db.query("SELECT * FROM organizations");
  return result.rows;
};

module.exports = { createOrganization, getOrganizations };
