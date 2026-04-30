CREATE TABLE achievement (
    achievement_id SERIAL PRIMARY KEY,
    point INT,
    description TEXT,
    icon_url TEXT,
    name VARCHAR(20)
);

CREATE TABLE achievement_user (
    achievement_user_id SERIAL PRIMARY KEY,
    achievement_id INT REFERENCES achievement(achievement_id) ON DELETE CASCADE,
    user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
    UNIQUE(achievement_id, user_id)
);