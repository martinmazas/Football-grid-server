const players = require('../data.json')
const { playerHandler } = require('../Utils/Handlers/playerHandler')
const PlayerProgram = require('../DB/Schemas/playerSchema')

module.exports = {
    getPlayers: (req, res) => {
        PlayerProgram.find({})
            .then(data => res.send(data))
            .catch(err => res.send(err))
    },
    async addPlayer(req, res) {
        const { firstName, secondName, imgPath, country, team } = {
            ...req.body
        }

        const newPlayer = new PlayerProgram({
            firstName: firstName,
            secondName: secondName,
            imgPath: imgPath,
            country: country,
            team: team
        })

        newPlayer
            .save()
            .then((docs) => {
                res.send(`Player ${firstName} ${secondName} was successfully added`)
            })
            .catch((err) => {
                res.sendStatus(400).json(err);
            });
    }
}