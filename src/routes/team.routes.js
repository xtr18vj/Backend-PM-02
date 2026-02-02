const express = require("express");
const router = express.Router();
const controller = require("../controller/team.controller");
const { authenticate } = require('../middleware/auth');

router.post("/teams", authenticate, controller.createTeam);
router.get("/teams", authenticate, controller.getAllTeams);
router.get("/teams/:id", authenticate, controller.getTeamById);
router.put("/teams/:id", authenticate, controller.updateTeam);
router.delete("/teams/:id", authenticate, controller.deleteTeam);

router.get("/teams/org/:orgId", authenticate, controller.getTeamsByOrg);

router.post("/teams/:id/users", authenticate, controller.addUserToTeam);
router.get("/teams/:id/users", authenticate, controller.getUsersInTeam);
router.delete("/teams/:id/users/:userId", authenticate, controller.removeUserFromTeam);

module.exports = router;
