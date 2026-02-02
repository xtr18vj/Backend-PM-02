const teamModel = require("../models/team.model");
const teamUsersModel = require("../models/team_users.model");

const createTeam = (req, res) => {
  try {
    const { name, orgId } = req.body;
    if (!name || !orgId) {
      return res.status(400).json({ success: false, message: 'Team name and organization ID are required' });
    }
    const team = teamModel.createTeam(name, orgId);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getTeamsByOrg = (req, res) => {
  try {
    const orgId = req.params.orgId;
    const teams = teamModel.getTeamsByOrg(orgId);
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getTeamById = (req, res) => {
  try {
    const team = teamModel.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAllTeams = (req, res) => {
  try {
    const teams = teamModel.getAllTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateTeam = (req, res) => {
  try {
    const { name } = req.body;
    const team = teamModel.updateTeam(req.params.id, name);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteTeam = (req, res) => {
  try {
    teamModel.deleteTeam(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const addUserToTeam = (req, res) => {
  try {
    const { userId, roleInTeam } = req.body;
    const teamId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const mapping = teamUsersModel.addUserToTeam(teamId, userId, roleInTeam || 'member');
    res.status(201).json({ success: true, data: mapping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUsersInTeam = (req, res) => {
  try {
    const users = teamUsersModel.getUsersInTeam(req.params.id);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const removeUserFromTeam = (req, res) => {
  try {
    const { id: teamId, userId } = req.params;
    teamUsersModel.removeUserFromTeam(teamId, userId);
    res.json({ success: true, message: 'User removed from team' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  createTeam, 
  getTeamsByOrg,
  getTeamById,
  getAllTeams,
  updateTeam,
  deleteTeam,
  addUserToTeam,
  getUsersInTeam,
  removeUserFromTeam,
};
