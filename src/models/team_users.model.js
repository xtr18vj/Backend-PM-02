const { TeamUserRepository } = require('../database/repositories');

const addUserToTeam = (teamId, userId, roleInTeam = 'member') => {
  return TeamUserRepository.create(teamId, userId, roleInTeam);
};

const getUsersInTeam = (teamId) => {
  return TeamUserRepository.findByTeamId(teamId);
};

const getTeamsForUser = (userId) => {
  return TeamUserRepository.findByUserId(userId);
};

const getUserTeamMapping = (teamId, userId) => {
  return TeamUserRepository.findByTeamAndUser(teamId, userId);
};

const updateUserRoleInTeam = (id, roleInTeam) => {
  return TeamUserRepository.updateRole(id, roleInTeam);
};

const removeUserFromTeam = (teamId, userId) => {
  return TeamUserRepository.removeUserFromTeam(teamId, userId);
};

module.exports = { 
  addUserToTeam, 
  getUsersInTeam,
  getTeamsForUser,
  getUserTeamMapping,
  updateUserRoleInTeam,
  removeUserFromTeam,
};
