const express = require("express")
const material = express.Router()
const DB = require('../db/dbConn.js')
const multer = require('multer')


let upload_dest = multer({ dest: 'uploads/' })


material.post('/add', upload_dest.single('file'), async (req, res) => {
    const {
        category,
        description,
        is_ecologically,
        is_sensitive,
        unit,
        name
    } = req.body;
    const file = req.file;

    const is_ecologically_bool = is_ecologically === 'true' ? true : false;
    const is_sensitive_bool = is_sensitive === 'true' ? true : false;

    if (!category || !description || !unit || !name || !file) {
        return res.status(400).json({ error: 'All fields including file are required.' });
    }

    file_name = `/uploads/${file.filename}`;

    try {
        await DB.AddMaterial({
            category,
            description,
            is_ecologically_bool,
            is_sensitive_bool,
            unit,
            name,
            file_name,
        });

        res.status(201).json({ message: 'Material successfully added.' });
    } catch (err) {
        console.error("Error adding material:", err);
        res.status(500).json({ error: 'Server error while adding material.' });
    }
});



module.exports = material