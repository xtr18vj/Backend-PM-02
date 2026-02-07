require("dotenv").config();
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./src/routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Management API running");
});

app.use("/tasks", taskRoutes);

module.exports = app;
