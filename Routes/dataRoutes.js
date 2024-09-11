const express = require('express')
const dataRoutes = express.Router()
const dataController = require('../Controllers/dataController')

dataController.get('/', dataController.getData)
dataController.post('/', dataController.saveData)

module.exports = { dataController }