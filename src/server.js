const express = require("express");
const taskRoutes = require("./modules/tasks/task.routes");

const app = express();

app.use(express.json());

// IMPORTANT
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Server working");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
