const orgModel = require("../models/organization.model");

const createOrganization = async (req, res) => {
  try {
    const org = await orgModel.createOrganization(req.body);
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const orgs = await orgModel.getOrganizations();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createOrganization, getOrganizations };
