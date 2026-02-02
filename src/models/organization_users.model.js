const db = require("../../db");

const addUserToOrganization = async (mapping) => {
  const result = await db.query(
    "INSERT INTO organization_users (id, org_id, user_id, role_in_org) VALUES ($1, $2, $3, $4) RETURNING *",
    [mapping.id, mapping.org_id, mapping.user_id, mapping.role_in_org]
  );
  return result.rows[0];
};

const getUsersInOrganization = async (orgId) => {
  const result = await db.query(
    "SELECT * FROM organization_users WHERE org_id = $1",
    [orgId]
  );
  return result.rows;
};

module.exports = { addUserToOrganization, getUsersInOrganization };
