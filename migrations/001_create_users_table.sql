CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    resume_url VARCHAR(255),
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    status TEXT CHECK (status IN ('active', 'inactive', 'banned')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
