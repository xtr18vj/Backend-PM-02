const express = require("express");
const router = express.Router();
const controller = require("./project.controller");

router.post("/projects", controller.createProject);
router.get("/projects", controller.getProjects);

module.exports = router;
