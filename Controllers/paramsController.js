const { getRandomNumbers, getFinalResult, setValuesToZero, getTeamCombination, writeLog } = require('../Utils/functions')
process.loadEnvFile()
const teams = require('../teams.json')
const allCountries = require('../countries.json')
const { getPlayers } = require('./playerController')

module.exports = {
    getParams: async (req, res) => {
        const rows = process.env.ROWS
        const columns = process.env.COLUMNS

        await getPlayers(req, res)

        // Reset teams and countries
        setValuesToZero()

        let playerNumbers = 0
        const noPossiblePlayers = []
        let countries = []
        let randomCountries = []
        let randomTeams = []

        while (randomCountries.length < 3 || playerNumbers < 7) {
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
            randomCountries = getRandomNumbers(columns, countries)

            // Calculate the final result
            if (randomCountries.length === 3) {
                const { playersNumber, noPossiblePlayersMatch } = { ...getFinalResult(randomCountries, randomTeams) }
                if (playersNumber) noPossiblePlayersMatch.map(n => noPossiblePlayers.push(n))
                playerNumbers = playersNumber
            }
        }

        const countryNames = randomCountries.map(country => country.name).join(', ');
        const teamNames = randomTeams.map(team => team.name).join(', ');

        const combinations = `${playerNumbers} combinations: countries=[${countryNames}], teams=[${teamNames}]`;

        writeLog(combinations, 'data')
        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}