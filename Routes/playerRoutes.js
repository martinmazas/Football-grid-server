const express = require('express')
const playerRoutes = express.Router()
const playerController = require('../Controllers/playerController')

playerRoutes.get('/', playerController.getPlayers)
playerRoutes.get('/guessPlayer', playerController.getPlayer)
playerRoutes.get('/:team', playerController.getPlayersByTeam)
playerRoutes.get('/image/:imgPath', playerController.getPlayerByImgPath)
playerRoutes.post('/newPlayer', playerController.addPlayer, playerController.getPlayersByTeam)
playerRoutes.put('/:id', playerController.modifyPlayer)
playerRoutes.delete('/', playerController.deletePlayer, playerController.getPlayersByTeam)

module.exports = { playerRoutes }