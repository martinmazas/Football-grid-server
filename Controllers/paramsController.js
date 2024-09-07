const { getRandomNumbers, getFinalResult, getTeamCombination, writeLog, getReqHeaders, getCachedTeams, getCachedCountries } = require('../Utils/functions')
require('dotenv').config()
const teams = getCachedTeams()
const cachedCountries = getCachedCountries()
const requestedNumber = process.env.REQUESTED_PLAYERS
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        try {
            const [ua, ip] = [...getReqHeaders(req)]

            // Initialize the variables
            let playerNumbers = 0
            const noPossiblePlayers = []
            let randomCountries = []
            let randomTeams = []

            // Iterates until the number of players is the requested
            while (playerNumbers < requestedNumber) {
                // Get random teams and define the country map
                randomTeams = getRandomNumbers(rows, teams)
                let countries = []

                randomTeams.map(team => {
                    // Get all the possible countries for the current team
                    const possibleCountries = [...getTeamCombination(team.name).keys()]
                    const countryMap = new Set(possibleCountries)

                    // Set the country in the map in order to get its count
                    possibleCountries.map(country => {
                        // if (!countryMap.has(country)) countryMap.set(country, 1)
                        const completeCountry = cachedCountries.filter(c => c.name === country)
                        // console.log(completeCountry, 'line 38')
                        if (countryMap.has(country) && completeCountry[0]) countries.push(completeCountry[0])
                    })
                })

                if (countries.length > rows - 1) {
                    // Get random countries based on the possible ones
                    randomCountries = getRandomNumbers(columns, countries)

                    // Calculate the final result
                    const { playersNumber, noPossiblePlayersMatch } = { ...getFinalResult(randomCountries, randomTeams) }

                    // Check the unmatched combinations
                    if (playersNumber >= requestedNumber) {
                        noPossiblePlayersMatch.map(n => noPossiblePlayers.push(n))
                    }

                    // Updates the playerNumbers
                    playerNumbers = playersNumber
                }
            }

            const message = `New parameters requested from ${ip}, UA: ${ua}, Teams: ${randomTeams.map(team => team.name)}, Countries: ${randomCountries.map(country => country.name)}`
            writeLog(message, 'INFO')
            res.status(200).send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, 'ERROR');
            res.status(500).send({ err: 'Failed to fetch game parameters' });
        }
    }
}