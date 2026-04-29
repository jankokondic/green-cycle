CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    description TEXT,
    category VARCHAR(50),
    difficulty difficulty_enum,
    time_required VARCHAR(20),
    create_at TIMESTAMP DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    title VARCHAR(255),
    instruction TEXT,
    thumbnail VARCHAR(255),
    user_id INT REFERENCES app_user(user_id) ON DELETE CASCADE
);

CREATE TABLE project_images (
    project_images_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES project(project_id) ON DELETE CASCADE,
    image_path VARCHAR(255)
);