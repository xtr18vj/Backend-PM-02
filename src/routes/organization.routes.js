const express = require("express");
const router = express.Router();
const controller = require("../controller/organization.controller");

// Create a new organization
router.post("/organizations", controller.createOrganization);

// Get all organizations
router.get("/organizations", controller.getOrganizations);

module.exports = router;
