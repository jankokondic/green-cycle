const express = require('express')
require('dotenv').config()
const cors = require("cors")
const path = require('path')
const port = process.env.PORT || 12345

// import local files
const user = require('./routes/user')

const app = express()
app.listen(port, () => console.log(`Example app listening on port ${port}!`))