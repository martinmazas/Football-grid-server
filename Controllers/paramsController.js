const { getRandomNumbers, getFinalResult, setValuesToZero, getTeamCombination } = require('../Utils/functions')
require('dotenv').config()
const teams = require('../teams.json')
const allCountries = require('../countries.json')
const requestedNumber = process.env.REQUESTED_PLAYERS
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        // Initialize the variables
        let playerNumbers = 0
        const noPossiblePlayers = []
        let countries = []
        let randomCountries = []
        let randomTeams = []

        while (playerNumbers < requestedNumber) {
            setValuesToZero()
            // Get random teams and define the country map
            randomTeams = getRandomNumbers(rows, teams)
            const countryMap = new Map()
            countries = []

            randomTeams.map(team => {
                // Get all the possible countries for the current team
                const possibleCountries = [...getTeamCombination(team.name).keys()]

                // Set the country in the map in order to get its count
                possibleCountries.map(country => {
                    if (!countryMap.has(country)) countryMap.set(country, 1)
                    else {
                        let count = countryMap.get(country)
                        const completeCountry = allCountries.filter(c => c.name === country)
                        countryMap.set(country, ++count)
                        if (count > 0 && completeCountry[0]) countries.push(completeCountry[0])
                    }
                })
            })

            // Get random countries based on the possible ones
            if (countries.length > rows - 1) randomCountries = getRandomNumbers(columns, countries)

            // Calculate the final result
            const { playersNumber, noPossiblePlayersMatch } = { ...getFinalResult(randomCountries, randomTeams) }

            if (playersNumber >= requestedNumber) {
                noPossiblePlayersMatch.map(n => noPossiblePlayers.push(n))
            }
            playerNumbers = playersNumber
        }

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}