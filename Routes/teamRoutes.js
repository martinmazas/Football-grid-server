const express = require('express')
const teamRoutes = express.Router()
const teamController = require('../Controllers/teamController')

teamRoutes.get('/', teamController.getTeams)

module.exports = { teamRoutes }