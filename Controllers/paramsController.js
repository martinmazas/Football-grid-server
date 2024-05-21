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
        // const noPossiblePlayers = []
        const countries = []

        // Get random teams and define the country map
        const randomTeams = getRandomNumbers(rows, teams)
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
        const randomCountries = getRandomNumbers(columns, countries)

        // Calculate the final result
        const { playersNumber, noPossiblePlayers } = { ...getFinalResult(randomCountries, randomTeams) }
        playerNumbers = playersNumber

        try {
            let combinations = `${playerNumbers} - countries: {`
            randomCountries.map(country => combinations += `${country.name}, `)
            combinations += '}\nteams: {'
            randomTeams.map(team => combinations += `${team.name}, `)
            combinations += '}\n\n'

            fs.appendFileSync('../combinations.txt', combinations)
        } catch (err) {
            console.log(err)
        }

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}