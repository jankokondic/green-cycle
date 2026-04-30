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