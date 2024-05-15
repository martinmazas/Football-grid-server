const { getRandomNumbers, getFinalResult, setValuesToZero } = require('../Utils/functions')
process.loadEnvFile()
const teams = require('../teams.json')
const countries = require('../countries.json')

module.exports = {
    getParams: async (req, res) => {
        const rows = process.env.ROWS
        const columns = process.env.COLUMNS
        setValuesToZero()
        let playerNumbers = 0
        const noPossiblePlayers = []

        const randomTeams = getRandomNumbers(rows, teams)
        const randomCountries = getRandomNumbers(columns, countries)

        await getFinalResult(randomCountries, randomTeams)
            .then(data => {
                playerNumbers = data.playersNumber
                noPossiblePlayers.push(data.noPossiblePlayers)
            })
            .catch(err => console.log(err))

        res.send({ rows, columns, randomTeams, randomCountries, playerNumbers, noPossiblePlayers })
    }
}