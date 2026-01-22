CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    -- This constraint links user_id to users.id
    -- It ensures every refresh token belongs to a real user
    -- If a user is deleted, all their refresh tokens are deleted automatically
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- This makes sure the same refresh token cannot exist more than once
    UNIQUE KEY uq_refresh_token (refresh_token),

    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
