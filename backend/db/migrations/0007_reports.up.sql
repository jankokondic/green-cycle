CREATE TABLE report (
    report_id SERIAL PRIMARY KEY,
    type report_type_enum,
    reason VARCHAR(255),
    date_reported TIMESTAMP DEFAULT NOW(),
    user_id INT REFERENCES app_user(user_id),
    project_id INT REFERENCES project(project_id),
    status report_status_enum DEFAULT 'pending'
);