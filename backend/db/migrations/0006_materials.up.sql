CREATE TABLE material (
    material_id SERIAL PRIMARY KEY,
    category VARCHAR(50),
    description TEXT,
    is_ecologically BOOLEAN,
    is_sensitive BOOLEAN,
    unit VARCHAR(20),
    name VARCHAR(50),
    icon VARCHAR(255)
);

CREATE TABLE material_project (
    material_project_id SERIAL PRIMARY KEY,
    material_id INT REFERENCES material(material_id) ON DELETE CASCADE,
    project_id INT REFERENCES project(project_id) ON DELETE CASCADE,
    quantity DECIMAL(10,0),
    UNIQUE(material_id, project_id)
);