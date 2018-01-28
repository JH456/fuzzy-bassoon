'use strict'

const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config').config
const groupme = require('./endpoints/groupme').router
const slack = require('./services/slack')

const app = express()

const options = {
    cert: fs.readFileSync('./.ssl/fullchain.pem'),
    key: fs.readFileSync('./.ssl/privkey.pem')
}

app.use(bodyParser.json())

app.use('/groupme/', groupme)

app.listen(3000);
https.createServer(options, app).listen(3443)

let bot = slack.create(config.slackAPIToken)

bot.addMessageListener((messageInfo) => {
    console.log(messageInfo)
})
