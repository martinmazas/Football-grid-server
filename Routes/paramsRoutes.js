const express = require('express')
const paramsController = require('../Controllers/paramsController')
const paramsRoutes = express.Router()

paramsRoutes.get('/', paramsController.getParams)

module.exports = { paramsRoutes }