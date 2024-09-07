const { getRandomNumbers, getFinalResult, setValuesToZero, getTeamCombination, writeLog, getReqHeaders, getCachedTeams, getCachedCountries } = require('../Utils/functions')
require('dotenv').config()
const teams = getCachedTeams()
const allCountries = getCachedCountries()
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
                setValuesToZero() // Restart the teams and countries

                // Get random teams and define the country map
                randomTeams = getRandomNumbers(rows, teams)
                const countryMap = new Map()
                let countries = []

                randomTeams.map(team => {
                    // Get all the possible countries for the current team
                    const possibleCountries = [...getTeamCombination(team.name).keys()]

                    // Set the country in the map in order to get its count
                    possibleCountries.map(country => {
                        if (!countryMap.has(country)) countryMap.set(country, 1)
                        const completeCountry = allCountries.filter(c => c.name === country)
                        if (countryMap.get(country) > 0 && completeCountry[0]) countries.push(completeCountry[0])
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