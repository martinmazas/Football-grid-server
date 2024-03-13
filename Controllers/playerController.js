const players = require('../data.json')
const { playerHandler } = require('../Utils/Handlers/playerHandler')
const PlayerProgram = require('../DB/Schemas/playerSchema')

module.exports = {
    getPlayers: (req, res) => {
        PlayerProgram.find({})
            .then(data => res.send(data))
            .catch(err => res.send(err))
    },
    addPlayer: (req, res) => {
        console.log(req.body);
        res.send('Done')
    }
}