const { getRandomNumbers, getFinalResult, setValuesToZero, getTeamCombination } = require('../Utils/functions')
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
        const countries = []

        // Get random teams and define the country map
        const randomTeams = getRandomNumbers(rows, teams)
        // const randomCountries = getRandomNumbers(columns, countries)
        const countryMap = new Map()

        // const randomTeams = [{ "name": "Barcelona", "code": "Barcelona" },
        // { "name": "Inter Milan", "code": "InterMilan" },
        // { "name": "Tottenham", "code": "Tottenham" }]

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
        const randomCountries = getRandomNumbers(columns, countries)

        // const randomCountries = [{ "name": "Czech Republic", "code": "CZ" },
        // { "name": "Brazil", "code": "BR" },
        // { "name": "Portugal", "code": "PT" }]

        // Calculate the final result
        await getFinalResult(randomCountries, randomTeams)
            .then(data => {
                playerNumbers = data.playersNumber
                noPossiblePlayers.push(data.noPossiblePlayers)
            })
            .catch(err => console.log(err))

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}