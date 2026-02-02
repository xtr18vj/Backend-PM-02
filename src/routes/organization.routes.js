const express = require("express");
const router = express.Router();
const controller = require("../controller/organization.controller");
const { authenticate } = require('../middleware/auth');

router.post("/organizations", authenticate, controller.createOrganization);
router.get("/organizations", authenticate, controller.getOrganizations);
router.get("/organizations/:id", authenticate, controller.getOrganizationById);
router.put("/organizations/:id", authenticate, controller.updateOrganization);
router.delete("/organizations/:id", authenticate, controller.deleteOrganization);

router.post("/organizations/:id/users", authenticate, controller.addUserToOrg);
router.get("/organizations/:id/users", authenticate, controller.getUsersInOrg);
router.delete("/organizations/:id/users/:userId", authenticate, controller.removeUserFromOrg);

module.exports = router;
