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

let addMappings = (slackChannel, groupmeBot) => {
    mappings[slackChannel] = groupmeBot
    mappings[groupmeBot.groupID] = slackChannel
    jsonfile.writeFile(config.mappingFile, mappings, (error) => {
        if (error) {
            console.log(error)
        }
    })
}

slackBot.addMessageListener((messageInfo) => {
    if (messageInfo.text) {
        if (messageInfo.text && messageInfo.text.indexOf('+join') === 0 &&
            messageInfo.text.length > 6) {
            let groupName = messageInfo.text.substring(6)
            groupme.joinGroup(groupName, config.groupmeName, config.callbackURL, config.groupmeAPIToken)
            .then((groupmeBot) => {
                addMappings(messageInfo.channel, groupmeBot)
            })
            .catch((error) => {
                slackBot.say(messageInfo.channel, error)
            })
        } else {
            groupme.sendMessage(mappings[messageInfo.channel], messageInfo.text)
        }
    }
})

groupmeRouter.post('/', (req, res) => {
    if (req.body) {
        slackBot.say(mappings[req.group_id], req.name + ": " + req.text)
    }
    res.status(200).send('OK')
})
