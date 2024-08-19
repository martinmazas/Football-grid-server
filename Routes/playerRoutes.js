const express = require('express')
const playerRoutes = express.Router()
const playerController = require('../Controllers/playerController')

playerRoutes.get('/', playerController.getPlayers)
playerRoutes.get('/guessPlayer', playerController.getPlayer)
playerRoutes.post('/newPlayer', playerController.addPlayer)
playerRoutes.put('/:id', playerController.modifyPlayer)

module.exports = { playerRoutes }