const { Pool } = require('pg');

const conn = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
});

// test konekcije
conn.connect()
    .then(client => {
        console.log('Connection established');
        client.release();
    })
    .catch(err => {
        console.log("ERROR: " + err.message);
    });

let dataPool = {};


dataPool.GetUserByUserName = (username) => {
    return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM user WHERE username = ?', [username], (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}


dataPool.GetUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const userQuery = `
            SELECT user_id, username, email, profile_picture, points
            FROM user
            WHERE user_id = ?
        `;

        const rolesQuery = `
            SELECT r.role_id, r.name, r.description
            FROM role_user ru
            JOIN role r ON ru.role_id = r.role_id
            WHERE ru.user_id = ?
        `;

        conn.query(userQuery, [userId], (err, userResults) => {
            if (err) return reject(err);
            if (userResults.length === 0) return resolve(null); // user not found

            const user = userResults[0];

            conn.query(rolesQuery, [userId], (err, roleResults) => {
                if (err) return reject(err);

                user.roles = roleResults;
                resolve(user);
            });
        });
    });
};
