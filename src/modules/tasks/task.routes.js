const express = require("express");
const controller = require("./task.controller");

const router = express.Router();

router.get("/", controller.listTasks);
router.get("/:id", controller.getTaskById);
router.post("/", controller.createTask);
router.patch("/:id", controller.updateTask);
router.delete("/:id", controller.deleteTask);

module.exports = router;
