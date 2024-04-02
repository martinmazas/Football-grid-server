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
                const { team, country, imgPath } = playerData[0]

                // Check if the player and country are in the board
                playerCountry = countries.find(c => c.includes(country))

                // Check if the player and team are in the board
                playerTeam = teams.find(t => t.includes(team))

                res.send((playerCountry && playerTeam ? { team, country, imgPath } : 'No matches'))
            })
            .catch(err => res.send('No matches'))
    },
    async addPlayer(req, res) {
        const { firstName, secondName, imgPath, country, team } = { ...req.body['formData'] }
        const newPlayer = new Player({
            first_name: firstName,
            second_name: secondName,
            imgPath: imgPath,
            country: country,
            team: team
        })

        Player.findOne({
            first_name: { $regex: firstName, $options: 'i' },
            second_name: { $regex: secondName, $options: 'i' }
        })
            .then(docs => {
                if (docs) {
                    res.send(`Player already exists`)
                } else {
                    newPlayer
                        .save()
                        .then((docs) => {
                            res.send(`Player ${firstName} ${secondName} was successfully added`)
                        })
                        .catch((err) => {
                            res.sendStatus(400).json(err);
                        });
                }

            })
            .catch(err => console.log(err))
    }

}