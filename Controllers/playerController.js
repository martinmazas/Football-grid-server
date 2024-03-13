const players = require('../data.json')

module.exports = {
    getPlayers : (req, res) => {
        res.send(players)
    },
    addPlayer : (req, res) => {
        console.log(req.body);
        res.send('Done')
    }
}