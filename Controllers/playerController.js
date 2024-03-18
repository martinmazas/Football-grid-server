const players = require('../data.json')
const { playerHandler } = require('../Utils/Handlers/playerHandler')
const Player = require('../DB/Schemas/playerSchema')

module.exports = {
    getPlayers: (req, res) => {
        Player.find({})
            .then(data => res.send(data))
            .catch(err => res.send(err))
    },
    getPlayer: (req, res) => {
        const { playerName, countries, teams } = { ...req.query }
        let playerCountry, playerTeam

        Player.find({ second_name: { $regex: playerName, $options: 'i' } })
            .then(playerData => {
                const { first_name, second_name, team, country, imgPath } = playerData[0]

                // Check if the player and country are in the board
                playerCountry = countries.find(c => c.includes(country))

                // Check if the player and team are in the board
                playerTeam = teams.find(t => t.includes(team))

                res.send((playerCountry && playerTeam ? {team, country, imgPath} : 'Not'))
            })
            .catch(err => console.log(err))
    },
    async addPlayer(req, res) {
        const newPlayer = new Player({
            ...req.body
        })

        newPlayer
            .save()
            .then((docs) => {
                res.send(`Player ${req.body.firstName} ${req.body.secondName} was successfully added`)
            })
            .catch((err) => {
                res.sendStatus(400).json(err);
            });
    }
}