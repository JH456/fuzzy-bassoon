'use strict';

let config = {
    slackAPIToken: process.env.SLACK_API_TOKEN,
    groupmeAPIToken: process.env.GROUPME_API_TOKEN,
    mappingFile: process.env.MAPPING_FILE,
    callbackURL: process.env.CALLBACK_URL,
    groupmeName: process.env.GROUPME_NAME
}

module.exports = {
    config
}
