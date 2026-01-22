CREATE TABLE applied_internship_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL, -- user given
    role VARCHAR(255), -- user given
    category VARCHAR(30) NOT NULL, -- user given
    status VARCHAR(30) NOT NULL, -- user given
    status_updated_at TIMESTAMP NULL,
    source VARCHAR(255), -- user given
    job_url TEXT, -- user given
    referral VARCHAR(255), -- user given
    location VARCHAR(255), -- user given
    salary_range VARCHAR(100), -- user given
    applied_date DATE NOT NULL,  -- user given
    notes TEXT, -- user given
    rejection_reason TEXT, -- user given
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_jobs
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
