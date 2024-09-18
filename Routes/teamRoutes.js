const express = require('express')
const teamRoutes = express.Router()
const teamController = require('../Controllers/teamsController')
const { getPlayersByTeam, deletePlayerByTeam } = require('../Controllers/playerController')

teamRoutes.get('/', teamController.getTeams)
teamRoutes.post('/newTeam', teamController.addTeam, getPlayersByTeam)
teamRoutes.delete('/', teamController.removeTeam, deletePlayerByTeam)

module.exports = { teamRoutes }