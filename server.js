'use strict'

const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config').config
const slack = require('./services/slack')

const app = express()

let slackBot = slack.create(config.slackAPIToken)
let groupmeRouter = express()

const options = {
    cert: fs.readFileSync('./.ssl/fullchain.pem'),
    key: fs.readFileSync('./.ssl/privkey.pem')
}

app.use(bodyParser.json())

app.use('/groupme/', groupmeRouter)

app.listen(3000);
https.createServer(options, app).listen(3443)

let mappings = {}

slackBot.addMessageListener((messageInfo) => {
    if (messageInfo.text) {
        if (messageInfo.text && messageInfo.text.indexOf('+join') === 0) {
            let groupName = messageInfo.text.substring(5)
            console.log(groupName)
        }
    }
})

groupmeRouter.post('/', (req, res) => {
    if (req.body && req.body.entry && req.body.entry[0]) {
        console.log("Body")
        console.log(req.body)
    }
    res.status(200).send('OK')
})

groupmeRouter.get('/', (req, res) => {
    console.log(req.query)
    if (req.query && req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'zucchini') {
        res.send(req.query['hub.challenge'])
    } else {
        res.status(400).send('bad request')
    }
})
