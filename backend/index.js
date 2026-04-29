const express = require('express')
const port = process.env.PORT || 12345

const app = express()
app.listen(port, () => console.log(`Example app listening on port ${port}!`))