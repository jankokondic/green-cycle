const express = require("express");
const project = express.Router();
const DB = require('../db/dbConn.js');
const multer = require('multer');

let upload_dest = multer({ dest: 'uploads/' });


module.exports = project;