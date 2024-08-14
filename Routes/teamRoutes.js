const express = require('express')
const teamRoutes = express.Router()
const teamController = require('../Controllers/teamsController')

teamRoutes.get('/', teamController.getTeams)
teamRoutes.post('/newTeam', teamController.addTeam)

module.exports = { teamRoutes }