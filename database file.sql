-- Task 2: User & Profile Management Schema

-- 1. Create custom types for User Role and Status
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- 2. Create the users table with profile fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'active',
    profile_photo TEXT,
    phone VARCHAR(20),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ===========================================
-- Project Management Schema (from Task 1)
-- ===========================================

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


