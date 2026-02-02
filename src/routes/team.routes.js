const express = require("express");
const router = express.Router();
const controller = require("../controller/team.controller");

// Create a new team
router.post("/teams", controller.createTeam);

// Get all teams for a specific organization
router.get("/teams/:orgId", controller.getTeamsByOrg);

module.exports = router;
