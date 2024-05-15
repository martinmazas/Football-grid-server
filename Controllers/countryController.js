const { getRandomNumbers } = require('../Utils/functions')
const countries = require('../countries.json')

const columns = 4

module.exports = {
    getCountries: (req, res) => {
        const randomCountries = getRandomNumbers(columns, countries)
        res.send(randomCountries)
    }
}