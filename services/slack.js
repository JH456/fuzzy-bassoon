'use strict';

const slack = require('@slack/client')

function create(token) {
    const rtm = new slack.RtmClient(token, {
        dataStore: false,
        useRtmConnect: true
    })
    const appData = {}
    rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
        appData.selfId = connectData.self.id
        console.log('Logged in')
    })
    rtm.start()

    let say = (to, text) => {
        rtm.sendMessage(text, to)
    }

    let addMessageListener = (callback) => {
        rtm.on(slack.RTM_EVENTS.MESSAGE, (message) => {
            if ((message.subtype && message.subtype === 'bot_message') ||
                (!message.subtype && message.user === appData.selfId)) {
                return;
            } else {
                let isPm = false // TODO, make this work
                let messageInfo = {
                    from: message.user,
                    text: message.text ? message.text : '',
                    message,
                    channel: message.channel,
                    isPm
                }
                callback(messageInfo)
            }
        })
    }

    return {
        say,
        rtm,
        appData,
        addMessageListener
    }
}

module.exports = {
    create
}
