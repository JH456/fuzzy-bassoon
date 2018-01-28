'use strict'

const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

const groupme = require('./endpoints/groupme').router

const app = express()

const options = {
    cert: fs.readFileSync('./.ssl/fullchain.pem'),
    key: fs.readFileSync('./.ssl/privkey.pem')
}

app.use(bodyParser.json())

app.use('/groupme/', groupme)

app.listen(3000);
https.createServer(options, app).listen(3443)
