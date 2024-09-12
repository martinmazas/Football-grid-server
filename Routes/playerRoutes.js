const express = require('express')
const playerRoutes = express.Router()
const playerController = require('../Controllers/playerController')
const dataController = require('../Controllers/dataController')

playerRoutes.get('/', playerController.getPlayers)
playerRoutes.get('/guessPlayer', playerController.getPlayer)
playerRoutes.get('/:team', playerController.getPlayersByTeam)
playerRoutes.post('/newPlayer', playerController.addPlayer, dataController.saveData)
playerRoutes.put('/:id', playerController.modifyPlayer)
playerRoutes.delete('/', playerController.deletePlayer, dataController.removeData)

module.exports = { playerRoutes }