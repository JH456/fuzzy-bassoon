'use strict';

let joinGroup = (groupName, callbackURL) => {
    return new Promise((resolve, reject) => {
        resolve(groupName)
    })
}

let sendMessage = (groupID, message) => {
    console.log('jim@' + groupID + ': ' + message)
}

module.exports = {
    joinGroup,
    sendMessage
}
