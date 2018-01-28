'use strict';

const request = require('request')

const groupmeAPIURL = 'https://api.groupme.com/v3/'

let joinRequest = (groupID, groupmeName, callbackURL, token) => {
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: groupmeAPIURL + 'bots?token=' + token,
            json: {
                bot: {
                    name: groupmeName,
                    group_id: '' + groupID,
                    callback_url: callbackURL
                }
            }
        }, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                resolve(groupID)
            }
        })
    })
}

let joinGroup = (groupName, groupmeName, callbackURL, token) => {
    return new Promise((resolve, reject) => {
        request(groupmeAPIURL + 'groups?token=' + token, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                let groups = JSON.parse(body).response.map((r) => {
                    return {name: r.name, id: r.group_id}
                })
                let group
                for (let i = 0; !group && i < groups.length; i++) {
                    if (groups[i].name === groupName) {
                        group = groups[i]
                    }
                }
                if (!group) {
                    reject('Group not found. Try:\n' + groups.map(g => g.name).join('\n'))
                } else {
                    joinRequest(group.id, groupmeName, callbackURL, token)
                    .then((groupID) => {
                        resolve(groupID)
                    })
                    .catch((error) => {
                        reject(error)
                    })
                }
            }
        })
    })
}

let sendMessage = (groupID, message) => {
    console.log('jim@' + groupID + ': ' + message)
}

module.exports = {
    joinGroup,
    sendMessage
}
