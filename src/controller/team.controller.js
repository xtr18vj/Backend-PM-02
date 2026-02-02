const teamModel = require("../models/team.model");

// Create a new team
const createTeam = async (req, res) => {
  try {
    const team = await teamModel.createTeam(req.body);
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teams for a specific organization
const getTeamsByOrg = async (req, res) => {
  try {
    const orgId = req.params.orgId; // orgId passed in URL
    const teams = await teamModel.getTeamsByOrg(orgId);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTeam, getTeamsByOrg };
