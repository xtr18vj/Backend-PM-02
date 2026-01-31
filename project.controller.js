const projectModel = require("./project.model");
const projectSchema = require("./project.validation");

const createProject = async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const project = await projectModel.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = { createProject, getProjects };
