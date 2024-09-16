const express = require('express')
const teamRoutes = express.Router()
const teamController = require('../Controllers/teamsController')
const { getPlayersByTeam } = require('../Controllers/playerController')

teamRoutes.get('/', teamController.getTeams)
teamRoutes.post('/newTeam', teamController.addTeam, getPlayersByTeam)

module.exports = { teamRoutes }