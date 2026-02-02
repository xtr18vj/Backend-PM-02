const { OrganizationRepository } = require('../database/repositories');

const createOrganization = (name) => {
  return OrganizationRepository.create(name);
};

const getOrganizations = () => {
  return OrganizationRepository.findAll();
};

const getOrganizationById = (id) => {
  return OrganizationRepository.findById(id);
};

const updateOrganization = (id, name) => {
  return OrganizationRepository.update(id, name);
};

const deleteOrganization = (id) => {
  return OrganizationRepository.delete(id);
};

module.exports = { 
  createOrganization, 
  getOrganizations, 
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
