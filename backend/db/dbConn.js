const { Pool } = require("pg");

const conn = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
});

conn.connect()
    .then((client) => {
        console.log("Connection established");
        client.release();
    })
    .catch((err) => {
        console.log("ERROR: " + err.message);
    });

let dataPool = {};

dataPool.GetUserByUserName = async (username) => {
    const result = await conn.query(
        `SELECT *
         FROM "user"
         WHERE username = $1`,
        [username]
    );

    return result.rows;
};

dataPool.CreateUser = async (username, hashedPassword, email, filePath) => {
    const client = await conn.connect();

    try {
        await client.query("BEGIN");

        const insertUserResult = await client.query(
            `INSERT INTO "user" 
             (username, password_hash, email, profile_picture)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id`,
            [username, hashedPassword, email, filePath]
        );

        const userId = insertUserResult.rows[0].user_id;
        const roleId = 3;

        await client.query(
            `INSERT INTO role_user 
             (role_id, user_id)
             VALUES ($1, $2)`,
            [roleId, userId]
        );

        await client.query("COMMIT");

        return {
            userId,
            message: "User and role inserted successfully",
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

dataPool.GetUserById = async (userId) => {
    const userResult = await conn.query(
        `SELECT user_id, username, email, profile_picture, points
         FROM "user"
         WHERE user_id = $1`,
        [userId]
    );

    if (userResult.rows.length === 0) {
        return null;
    }

    const user = userResult.rows[0];

    const rolesResult = await conn.query(
        `SELECT r.role_id, r.name, r.description
         FROM role_user ru
         JOIN role r ON ru.role_id = r.role_id
         WHERE ru.user_id = $1`,
        [userId]
    );

    user.roles = rolesResult.rows;

    return user;
};

dataPool.CreateProject = async (project, materials, imagePaths) => {
    const client = await conn.connect();

    try {
        await client.query("BEGIN");

        const queryProject = `
            INSERT INTO project 
                (title, description, category, difficulty, time_required, is_published, instruction, thumbnail, create_at, user_id)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING project_id
        `;

        const values = [
            project.title,
            project.description,
            project.category,
            project.difficulty,
            project.time_required,
            project.is_published,
            project.instruction,
            project.thumbnail,
            new Date(),
            project.user
        ];

        const projectResult = await client.query(queryProject, values);
        const projectId = projectResult.rows[0].project_id;

        if (materials && materials.length > 0) {
            for (const item of materials) {
                await client.query(
                    `INSERT INTO material_project 
                        (project_id, material_id, quantity)
                     VALUES 
                        ($1, $2, $3)`,
                    [projectId, item.id, item.quantity]
                );
            }
        }

        if (imagePaths && imagePaths.length > 0) {
            for (const imagePath of imagePaths) {
                await client.query(
                    `INSERT INTO project_images 
                        (project_id, image_path)
                     VALUES 
                        ($1, $2)`,
                    [projectId, imagePath]
                );
            }
        }

        await client.query("COMMIT");

        return projectId;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

dataPool.UpdateProject = async (projectId, updates, materials, imagePaths) => {
    const client = await conn.connect();

    try {
        await client.query("BEGIN");

        if (updates && Object.keys(updates).length > 0) {
            const keys = Object.keys(updates);
            const values = Object.values(updates);

            const columns = keys
                .map((key, index) => `${key} = $${index + 1}`)
                .join(", ");

            const query = `
                UPDATE project
                SET ${columns}
                WHERE project_id = $${keys.length + 1}
            `;

            await client.query(query, [...values, projectId]);
        }

        if (materials) {
            await client.query(
                `DELETE FROM material_project WHERE project_id = $1`,
                [projectId]
            );

            for (const material of materials) {
                await client.query(
                    `INSERT INTO material_project 
                        (project_id, material_id, quantity)
                     VALUES 
                        ($1, $2, $3)`,
                    [projectId, material.id, material.quantity]
                );
            }
        }

        if (imagePaths) {
            await client.query(
                `DELETE FROM project_images WHERE project_id = $1`,
                [projectId]
            );

            for (const imagePath of imagePaths) {
                await client.query(
                    `INSERT INTO project_images 
                        (project_id, image_path)
                     VALUES 
                        ($1, $2)`,
                    [projectId, imagePath]
                );
            }
        }

        await client.query("COMMIT");

        return {
            success: true,
            message: "Project updated successfully",
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

dataPool.GetProjectDetails = async (projectId) => {
    const projectResult = await conn.query(
        `SELECT *
         FROM project
         WHERE project_id = $1`,
        [projectId]
    );

    if (projectResult.rows.length === 0) {
        throw new Error("Project not found");
    }

    const project = projectResult.rows[0];

    const materialsResult = await conn.query(
        `SELECT 
            mp.material_id,
            mp.quantity,
            m.name,
            m.category,
            m.unit,
            m.description,
            m.is_ecologically,
            m.is_sensitive,
            m.icon
         FROM material_project mp
         JOIN material m ON mp.material_id = m.material_id
         WHERE mp.project_id = $1`,
        [projectId]
    );

    const imagesResult = await conn.query(
        `SELECT image_path
         FROM project_images
         WHERE project_id = $1`,
        [projectId]
    );

    return {
        project,
        materials: materialsResult.rows,
        images: imagesResult.rows.map(row => row.image_path),
    };
};

dataPool.SearchProjects = async ({
    searchText,
    category,
    difficulty,
    materialName
}) => {
    let query = `
        SELECT DISTINCT p.*
        FROM project p
        LEFT JOIN material_project mp ON p.project_id = mp.project_id
        LEFT JOIN material m ON mp.material_id = m.material_id
        WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (searchText) {
        query += ` AND (
            p.title ILIKE $${paramIndex} OR 
            p.description ILIKE $${paramIndex} OR 
            p.instruction ILIKE $${paramIndex}
        )`;

        values.push(`%${searchText}%`);
        paramIndex++;
    }

    if (category) {
        query += ` AND p.category = $${paramIndex}`;
        values.push(category);
        paramIndex++;
    }

    if (difficulty) {
        query += ` AND p.difficulty = $${paramIndex}`;
        values.push(difficulty);
        paramIndex++;
    }

    if (materialName) {
        query += ` AND m.name ILIKE $${paramIndex}`;
        values.push(`%${materialName}%`);
        paramIndex++;
    }

    const result = await conn.query(query, values);
    return result.rows;
};

dataPool.DeleteProject = async (projectId) => {
    const result = await conn.query(
        `DELETE FROM project 
         WHERE project_id = $1 
         RETURNING project_id`,
        [projectId]
    );

    if (result.rows.length === 0) {
        throw new Error("Project not found");
    }

    return { success: true };
};

dataPool.AddMaterial = async (material) => {
    const {
        category,
        description,
        is_ecologically_bool,
        is_sensitive_bool,
        unit,
        name,
        file_name
    } = material;

    const query = `
        INSERT INTO material (
            category,
            description,
            is_ecologically,
            is_sensitive,
            unit,
            name,
            icon
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const values = [
        category,
        description,
        is_ecologically_bool,
        is_sensitive_bool,
        unit,
        name,
        file_name
    ];

    const result = await conn.query(query, values);

    return result.rows[0];
};

dataPool.DeleteMaterial = async (material_id) => {
    const result = await conn.query(
        `DELETE FROM material 
         WHERE material_id = $1 
         RETURNING material_id`,
        [material_id]
    );

    if (result.rows.length === 0) {
        throw new Error("Material not found");
    }

    return {
        success: true,
        material_id: result.rows[0].material_id
    };
};

dataPool.EditMaterial = async (material_id, updates) => {
    const keys = Object.keys(updates);

    if (keys.length === 0) {
        return;
    }

    const columns = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

    const values = Object.values(updates);

    const query = `
        UPDATE material
        SET ${columns}
        WHERE material_id = $${keys.length + 1}
        RETURNING *
    `;

    const result = await conn.query(query, [...values, material_id]);

    if (result.rows.length === 0) {
        throw new Error("Material not found");
    }

    return result.rows[0];
};

dataPool.SearchMaterials = async ({ name, is_ecologically, is_sensitive, unit }) => {
    let query = 'SELECT * FROM material WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (name) {
        query += ` AND name ILIKE $${paramIndex}`;
        values.push(`%${name}%`);
        paramIndex++;
    }

    if (is_ecologically !== undefined) {
        query += ` AND is_ecologically = $${paramIndex}`;
        values.push(is_ecologically);
        paramIndex++;
    }

    if (is_sensitive !== undefined) {
        query += ` AND is_sensitive = $${paramIndex}`;
        values.push(is_sensitive);
        paramIndex++;
    }

    if (unit) {
        query += ` AND unit = $${paramIndex}`;
        values.push(unit);
        paramIndex++;
    }

    const result = await conn.query(query, values);
    return result.rows;
};

dataPool.GetAllMaterials = async () => {
    const query = `
        SELECT 
            material_id, 
            category, 
            description, 
            is_ecologically, 
            is_sensitive, 
            unit, 
            name, 
            icon
        FROM material 
        ORDER BY material_id DESC
    `;

    const result = await conn.query(query);

    return result.rows;
};

dataPool.GetUsersWithPermissions = async () => {
    const result = await conn.query(`
        SELECT 
            u.user_id,
            u.username,
            r.name AS role_name,
            r.description AS role_description
        FROM "user" u
        JOIN role_user ru ON u.user_id = ru.user_id
        JOIN role r ON ru.role_id = r.role_id
        ORDER BY u.user_id;
    `);

    const usersMap = new Map();

    result.rows.forEach(row => {
        if (!usersMap.has(row.user_id)) {
            usersMap.set(row.user_id, {
                user_id: row.user_id,
                username: row.username,
                roles: []
            });
        }

        usersMap.get(row.user_id).roles.push({
            name: row.role_name,
            description: row.role_description
        });
    });

    return Array.from(usersMap.values());
};

dataPool.AssignRoleToUser = async (user_id, role_id) => {
    const checkResult = await conn.query(
        `SELECT *
         FROM role_user
         WHERE user_id = $1 AND role_id = $2`,
        [user_id, role_id]
    );

    if (checkResult.rows.length > 0) {
        throw {
            status: 409,
            message: 'This user already has that role.'
        };
    }

    const insertResult = await conn.query(
        `INSERT INTO role_user (role_id, user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [role_id, user_id]
    );

    return insertResult.rows[0];
};

dataPool.RemoveUserRole = async (user_id, role_id) => {
    const result = await conn.query(
        `DELETE FROM role_user
         WHERE user_id = $1 AND role_id = $2`,
        [user_id, role_id]
    );

    if (result.rowCount === 0) {
        throw {
            status: 404,
            message: 'Role not found for this user.'
        };
    }

    return {
        message: 'Role removed successfully.'
    };
};

dataPool.AddReport = async ({ type, reason, user_id, project_id }) => {
    const result = await conn.query(
        `INSERT INTO report
         (type, reason, date_reported, user_id, project_id, status)
         VALUES ($1, $2, NOW(), $3, $4, 'pending')
         RETURNING report_id`,
        [type, reason, user_id, project_id]
    );

    return result.rows[0].report_id;
};

dataPool.UpdateReportStatus = async (report_id, status) => {
    const result = await conn.query(
        `UPDATE report
         SET status = $1
         WHERE report_id = $2`,
        [status, report_id]
    );

    if (result.rowCount === 0) {
        throw new Error('Report not found');
    }
};

dataPool.GetPendingReports = async () => {
    const result = await conn.query(
        `SELECT *
         FROM report
         WHERE status = 'pending'`
    );

    return result.rows;
};

dataPool.AddComment = async ({ content, user_id, project_id = null }) => {
    const result = await conn.query(
        `INSERT INTO comment
         (content, created_at, user_id, project_id)
         VALUES ($1, NOW(), $2, $3)
         RETURNING comment_id`,
        [content, user_id, project_id]
    );

    return result.rows[0].comment_id;
};

dataPool.UpdateComment = async (comment_id, user_id, content) => {
    const result = await conn.query(
        `UPDATE comment
         SET content = $1
         WHERE comment_id = $2 AND user_id = $3`,
        [content, comment_id, user_id]
    );

    if (result.rowCount === 0) {
        throw new Error('Comment not found or user not authorized.');
    }
};

dataPool.DeleteComment = async (comment_id, user_id, user_role) => {
    let query = `
        DELETE FROM comment
        WHERE comment_id = $1
    `;

    const values = [comment_id];

    if (user_role !== 'admin' && user_role !== 'moderator') {
        query += ` AND user_id = $2`;
        values.push(user_id);
    }

    const result = await conn.query(query, values);

    if (result.rowCount === 0) {
        throw new Error('Comment not found or unauthorized.');
    }
};

dataPool.GetCommentsByProjectId = async (projectId) => {
    const result = await conn.query(
        `SELECT 
            c.comment_id,
            c.content,
            c.created_at,
            c.user_id,
            c.project_id,
            u.username,
            u.profile_picture
         FROM comment c
         JOIN "user" u ON c.user_id = u.user_id
         WHERE c.project_id = $1
         ORDER BY c.created_at DESC`,
        [projectId]
    );

    return result.rows;
};

module.exports = dataPool;