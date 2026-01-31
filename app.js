const express = require('express');
const app = express();
// Import the handler from your controller
const { handleCreateProject, getProjects } = require('./project.controller');

// Middleware to parse JSON data sent from Postman or a frontend
app.use(express.json());

// This defines the URL path where you can create projects
app.post('/projects', handleCreateProject);

// A simple test route to make sure the server is working
app.get('/', (req, res) => {
    res.send("Task 5 Backend Server is Running!");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// ... keep your existing code and 'app.post' line ...

// ADD THIS NEW LINE
app.get('/projects', getProjects); 

// ... keep your 'app.listen' code at the bottom ...