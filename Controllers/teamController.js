const { getRandomNumbers } = require('../Utils/functions')
const teams = require('../teams.json')

const rows = columns = 4

module.exports = {
    getTeams: (req, res) => {
        const randomTeams = getRandomNumbers(rows, teams)
        console.log(randomTeams)
        res.send(randomTeams)
    }
}