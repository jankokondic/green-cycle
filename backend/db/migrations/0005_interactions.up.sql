CREATE TABLE comment (
    comment_id SERIAL PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INT REFERENCES app_user(user_id) ON DELETE CASCADE,
    project_id INT REFERENCES project(project_id) ON DELETE CASCADE
);

CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    send_at TIMESTAMP DEFAULT NOW(),
    content VARCHAR(800),
    user_receive_id INT REFERENCES app_user(user_id),
    user_sender_id INT REFERENCES app_user(user_id)
);