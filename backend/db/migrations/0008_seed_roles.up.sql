INSERT INTO role (role_id, name, description)
VALUES
    (1, 'admin', 'Administrator'),
    (2, 'moderator', 'Moderator'),
    (3, 'user', 'Regular user')
ON CONFLICT (role_id) DO NOTHING;