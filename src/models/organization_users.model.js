const { OrganizationUserRepository } = require('../database/repositories');

const addUserToOrganization = (orgId, userId, roleInOrg = 'member') => {
  return OrganizationUserRepository.create(orgId, userId, roleInOrg);
};

const getUsersInOrganization = (orgId) => {
  return OrganizationUserRepository.findByOrgId(orgId);
};

const getOrganizationsForUser = (userId) => {
  return OrganizationUserRepository.findByUserId(userId);
};

const getUserOrgMapping = (orgId, userId) => {
  return OrganizationUserRepository.findByOrgAndUser(orgId, userId);
};

const updateUserRoleInOrg = (id, roleInOrg) => {
  return OrganizationUserRepository.updateRole(id, roleInOrg);
};

const removeUserFromOrganization = (orgId, userId) => {
  return OrganizationUserRepository.removeUserFromOrg(orgId, userId);
};

module.exports = { 
  addUserToOrganization, 
  getUsersInOrganization,
  getOrganizationsForUser,
  getUserOrgMapping,
  updateUserRoleInOrg,
  removeUserFromOrganization,
};
