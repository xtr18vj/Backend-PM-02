const db = require("../../db");

const createTeam = async (team) => {
  const result = await db.query(
    "INSERT INTO teams (id, name, org_id) VALUES ($1, $2, $3) RETURNING *",
    [team.id, team.name, team.org_id]
  );
  return result.rows[0];
};

const getTeamsByOrg = async (orgId) => {
  const result = await db.query(
    "SELECT * FROM teams WHERE org_id = $1",
    [orgId]
  );
  return result.rows;
};

module.exports = { createTeam, getTeamsByOrg };
