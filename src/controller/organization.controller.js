const orgModel = require("../models/organization.model");
const orgUsersModel = require("../models/organization_users.model");

const createOrganization = (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Organization name is required' });
    }
    const org = orgModel.createOrganization(name);
    res.status(201).json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getOrganizations = (req, res) => {
  try {
    const orgs = orgModel.getOrganizations();
    res.json({ success: true, data: orgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getOrganizationById = (req, res) => {
  try {
    const org = orgModel.getOrganizationById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateOrganization = (req, res) => {
  try {
    const { name } = req.body;
    const org = orgModel.updateOrganization(req.params.id, name);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }
    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteOrganization = (req, res) => {
  try {
    orgModel.deleteOrganization(req.params.id);
    res.json({ success: true, message: 'Organization deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const addUserToOrg = (req, res) => {
  try {
    const { userId, roleInOrg } = req.body;
    const orgId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const mapping = orgUsersModel.addUserToOrganization(orgId, userId, roleInOrg || 'member');
    res.status(201).json({ success: true, data: mapping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUsersInOrg = (req, res) => {
  try {
    const users = orgUsersModel.getUsersInOrganization(req.params.id);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const removeUserFromOrg = (req, res) => {
  try {
    const { id: orgId, userId } = req.params;
    orgUsersModel.removeUserFromOrganization(orgId, userId);
    res.json({ success: true, message: 'User removed from organization' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  createOrganization, 
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  addUserToOrg,
  getUsersInOrg,
  removeUserFromOrg,
};
