const players = require('../data.json')

module.exports = {
    getPlayers : (req, res) => {
        res.send(players)
    }
}