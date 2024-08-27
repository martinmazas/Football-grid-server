const express = require('express')
const countryRoutes = express.Router()
const countryController = require('../Controllers/countryController')

countryRoutes.get('/', countryController.getCountries)

module.exports = { countryRoutes }