const express = require('express')
const countryController = require('../Controllers/countryController')
const countryRoutes = express.Router()

countryRoutes.get('/', countryController.getCountries)

module.exports = { countryRoutes }