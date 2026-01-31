-- 1. Create custom types for Status and Priority
CREATE TYPE project_status AS ENUM ('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE project_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 2. Create the projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    organization_id INT,
    team_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'PLANNED',
    priority project_priority DEFAULT 'MEDIUM',
    start_date DATE,
    end_date DATE,
    owner_id INT,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


