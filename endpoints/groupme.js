'use strict'

const express = require('express')

const router = express()

router.post('/', (req, res) => {
    if (req.body && req.body.entry && req.body.entry[0]) {
        console.log("Body")
        console.log(req.body)
    }
    res.status(200).send('OK')
})

router.get('/', (req, res) => {
    console.log(req.query)
    if (req.query && req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'zucchini') {
        res.send(req.query['hub.challenge'])
    } else {
        res.status(400).send('bad request')
    }
})

module.exports = {
    router
}
