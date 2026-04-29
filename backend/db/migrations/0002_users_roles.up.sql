CREATE TABLE app_user (
    user_id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_picture VARCHAR(255),
    username VARCHAR(50) NOT NULL UNIQUE,
    points INT DEFAULT 0
);

CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    description TEXT
);

CREATE TABLE role_user (
    role_user_id SERIAL PRIMARY KEY,
    role_id INT REFERENCES role(role_id) ON DELETE CASCADE,
    user_id INT REFERENCES app_user(user_id) ON DELETE CASCADE,
    UNIQUE(role_id, user_id)
);