const express = require("express")
const users = express.Router()
const DB = require('../db/dbConn.js')
const multer = require('multer')
const bcrypt = require('bcrypt')

let upload_dest = multer({ dest: 'uploads/' })

users.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Please enter Username and Password!" });
    }

    try {
        const queryResult = await DB.GetUserByUserName(username);

        if (queryResult.length === 0) {
            return res.status(404).json({ success: false, message: "User not registered" });
        }

        const user = queryResult[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        const fullUser = await DB.GetUserById(user.user_id);

        req.session.logged_in = true;
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            roles: fullUser.roles.map(role => role.name)
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: fullUser
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

users.get('/session', async (req, res, next) => {
    try {
        console.log("session data: ")
        console.log(req.session)
        res.json(req.session);
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
        next()
    }
})