const Player = require('../DB/Schemas/playerSchema')
const { filterCountriesPerTeam } = require('../Utils/functions')

function diacriticSensitiveRegex(string = '') {
    return string
        .replace(/a/g, '[a,á,à,ä,â]')
        .replace(/A/g, '[A,a,á,à,ä,â]')
        .replace(/e/g, '[e,é,ë,è,ê]')
        .replace(/E/g, '[E,e,é,ë,è]')
        .replace(/i/g, '[i,í,ï,ì]')
        .replace(/I/g, '[I,i,í,ï,ì]')
        .replace(/o/g, '[o,ó,ö,ò]')
        .replace(/O/g, '[O,o,ó,ö,ò,ø]')
        .replace(/u/g, '[u,ü,ú,ù]')
        .replace(/U/g, '[U,u,ü,ú,ù]')
}

module.exports = {
    getPlayers: async (req, res) => {
        let players = []

        await Player.find({})
            .then(data => {
                data.map(player => players.push({ name: player.first_name, last_name: player.second_name, team: player.team, country: player.country, img: `${player.imgPath}.jpeg` }))
                players.sort((a, b) => a.last_name.localeCompare(b.last_name))
                res.send(players)
                filterCountriesPerTeam(data)
            })
            .catch(err => {
                res.send(err)
            })
    },
    getPlayer: async (req, res) => {
        const { playerName, countryNames, teamNames } = { ...req.query }
        let playerCountry, playerTeam

        let countryList = countryNames.map(country => country.name)
        let teamList = teamNames.map(team => team.name)

        if (playerName !== '') {
            await Player.find({ second_name: { $regex: '^' + diacriticSensitiveRegex(playerName) + '$', $options: 'i' } })
                .then(playerData => {
                    const possiblePlayers = []

                    playerData.map(player => {
                        playerCountry = countryList.find(c => c.includes(player.country))
                        if (playerCountry) playerTeam = teamList.find(t => t.includes(player.team))
                        if (playerCountry && playerTeam) {
                            const editedPlayer = { team: playerTeam, country: playerCountry, imgPath: player.imgPath, first_name: player.first_name, secondName: player.second_name }
                            possiblePlayers.push(editedPlayer)
                        }
                    })
                    res.send(possiblePlayers.length ? possiblePlayers : `${playerName} not found`)
                })
                .catch(err => {
                    res.send('No matches')
                })
        } else {
            res.send('Player name is empty')
        }
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

        await Player.findOne({
            first_name: { $regex: '^' + diacriticSensitiveRegex(firstName) + '$', $options: 'i' },
            second_name: { $regex: '^' + diacriticSensitiveRegex(secondName) + '$', $options: 'i' }
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
                            res.sendStatus(400).json(err)
                        });
                }

            })
            .catch(err => console.log(err))
    }
}