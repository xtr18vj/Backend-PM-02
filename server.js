const express = require("express");
const app = express();
const projectRoutes = require("./project.routes");

app.use(express.json());
app.use("/api", projectRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
