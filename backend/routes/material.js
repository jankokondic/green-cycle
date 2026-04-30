const express = require("express")
const material = express.Router()
const DB = require('../db/dbConn.js')
const multer = require('multer')


let upload_dest = multer({ dest: 'uploads/' })





module.exports = material