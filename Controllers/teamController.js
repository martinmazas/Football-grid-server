const { getRandomNumbers } = require('../Utils/functions')
const teams = require('../teams.json')

const rows = 4

module.exports = {
    getTeams: (req, res) => {
        const randomTeams = getRandomNumbers(rows, teams)
        res.send(randomTeams)
    }
}