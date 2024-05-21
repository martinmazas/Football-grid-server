const { getRandomNumbers, getFinalResult, setValuesToZero, getTeamCombination } = require('../Utils/functions')
process.loadEnvFile()
const teams = require('../teams.json')
const allCountries = require('../countries.json')
const { getPlayers } = require('./playerController')
const fs = require('fs')

module.exports = {
    getParams: async (req, res) => {
        const rows = process.env.ROWS
        const columns = process.env.COLUMNS

        await getPlayers(req, res)

        // Reset teams and countries
        setValuesToZero()

        let playerNumbers = 0
        const noPossiblePlayers = []
        const countries = []
        let randomCountries = []
        let randomTeams = []

        while (randomCountries.length < 3) {
            console.log(randomCountries, 'line 24')
            // Get random teams and define the country map
            randomTeams = getRandomNumbers(rows, teams)
            const countryMap = new Map()

            randomTeams.map(team => {
                // Get all the possible countries for the current team
                const possibleCountries = [...getTeamCombination(team.name).keys()]

                // Set the country in the map in order to get its count
                possibleCountries.map(country => {
                    if (!countryMap.has(country)) countryMap.set(country, 1)
                    else {
                        let count = countryMap.get(country)
                        const completeCountry = allCountries.filter(c => c.name === country)
                        if (count > 0) countries.push(completeCountry[0])
                        countryMap.set(country, ++count)
                    }
                })
            })

            // Get random countries based on the possible ones
            randomCountries = getRandomNumbers(columns, countries)

            // Calculate the final result
            while (playerNumbers < 5) {
                console.log(playerNumbers, 'line 50')
                const { playersNumber, noPossiblePlayersMatch } = { ...getFinalResult(randomCountries, randomTeams) }
                noPossiblePlayersMatch.map(n => noPossiblePlayers.push(n))
                playerNumbers = playersNumber
            }
        }

        try {
            const countryNames = randomCountries.map(country => country.name).join(', ');
            const teamNames = randomTeams.map(team => team.name).join(', ');

            const combinations = `${playerNumbers} combinations: countries=[${countryNames}], teams=[${teamNames}]\n`;

            // Append the combinations string to the log file
            fs.appendFileSync('./Logs/combinations.log', combinations);
        } catch (err) {
            console.log(err)
        }

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}