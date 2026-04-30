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

module.exports = dataPool;