const { TeamRepository } = require('../database/repositories');

const createTeam = (name, orgId) => {
  return TeamRepository.create(name, orgId);
};

const getTeamsByOrg = (orgId) => {
  return TeamRepository.findByOrgId(orgId);
};

const getTeamById = (id) => {
  return TeamRepository.findById(id);
};

const getAllTeams = () => {
  return TeamRepository.findAll();
};

const updateTeam = (id, name) => {
  return TeamRepository.update(id, name);
};

const deleteTeam = (id) => {
  return TeamRepository.delete(id);
};

module.exports = { 
  createTeam, 
  getTeamsByOrg, 
  getTeamById,
  getAllTeams,
  updateTeam,
  deleteTeam,
};
