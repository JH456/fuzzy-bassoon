'use strict'

const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile')

const config = require('./config').config
const slack = require('./services/slack')
const groupme = require('./services/groupme')

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

jsonfile.readFile(config.mappingFile, (error, data) => {
    if (error) {
        console.log('Could not read mappings file')
    } else {
        mappings = data
    }
})

let addMappings = (slackChannel, groupmeGroup) => {
    mappings[slackChannel] = groupmeGroup
    mappings[groupmeGroup] = slackChannel
    jsonfile.writeFile(config.mappingFile, mappings, (error) => {
        console.log(error)
    })
}

slackBot.addMessageListener((messageInfo) => {
    if (messageInfo.text) {
        if (messageInfo.text && messageInfo.text.indexOf('+join') === 0 &&
            messageInfo.text.length > 6) {
            let groupName = messageInfo.text.substring(6)
            groupme.joinGroup(groupName, config.callbackURL)
            .then((groupmeGroupID) => {
                console.log(groupmeGroupID)
                addMappings(messageInfo.channel, groupmeGroupID)
            })
            .catch((error) => {
                console.log(error)
            })
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
