const express = require('express')
const logController = require('../Controllers/logController')
const logRoutes = express.Router()

// Get params when the game is started
logRoutes.post('/', logController.getLog)

module.exports = { logRoutes }