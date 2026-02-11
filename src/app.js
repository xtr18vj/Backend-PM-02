const express = require("express");
const cors = require("cors");

const taskRoutes = require("./modules/tasks/task.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", taskRoutes);

app.use(errorMiddleware);

module.exports = app;