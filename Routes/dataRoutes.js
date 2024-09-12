const express = require('express')
const dataRoutes = express.Router()
const dataController = require('../Controllers/dataController')

dataRoutes.get('/', dataController.getData)
dataRoutes.post('/', dataController.saveData)
dataRoutes.post('/', dataController.saveAll)

module.exports = { dataRoutes }