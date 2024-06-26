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

        // Iterates until the number of players is the requested
        while (playerNumbers < requestedNumber) {
            // Restart the teams and countries
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
                    countryMap.set(country, countryMap.get(country) + 1 || 1)
                    const completeCountry = allCountries.filter(c => c.name === country)
                    if (countryMap.get(country) > 0 && completeCountry[0]) countries.push(completeCountry[0])
                })
            })

            // Get random countries based on the possible ones
            if (countries.length > rows - 1) randomCountries = getRandomNumbers(columns, countries)

            // Calculate the final result
            const { playersNumber, noPossiblePlayersMatch } = { ...getFinalResult(randomCountries, randomTeams) }

            // Check the unmatched combinations
            if (playersNumber >= requestedNumber) {
                noPossiblePlayersMatch.map(n => noPossiblePlayers.push(n))
            }

            // Updates the playerNumbers
            playerNumbers = playersNumber
        }

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}