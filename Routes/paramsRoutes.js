const express = require('express')
const paramsController = require('../Controllers/paramsController')
const paramsRoutes = express.Router()

// Get params when the game is started
paramsRoutes.get('/', paramsController.getParams)

module.exports = { paramsRoutes }