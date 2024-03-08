const express = require('express')
const playerRoutes = express.Router()
const playerController = require('../Controllers/playerController')

playerRoutes.get('/', playerController.getPlayers)

module.exports = { playerRoutes }