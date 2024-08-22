const Player = require('../DB/Schemas/playerSchema')
const { filterCountriesPerTeam, writeLog, getReqHeaders } = require('../Utils/functions')

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
        const [ua, ip] = [...getReqHeaders(req)]

        await Player.find({})
            .then(data => {
                data.map(player => players.push({ name: player.first_name, last_name: player.second_name, team: player.team, country: player.country, img: `${player.imgPath}.jpeg` }))
                players.sort((a, b) => a.last_name.localeCompare(b.last_name))
                filterCountriesPerTeam(data)
                const message = `Get players function was called by ${ip}, UA: ${ua}`
                writeLog(message, 'INFO')
                res.send(players)
            })
            .catch(err => {
                const message = `${err} when calling Get players function by ${ip}, UA: ${ua}`
                writeLog(message, 'ERROR')
                res.send(err)
            })
    },
    getPlayer: async (req, res) => {
        const { playerName, countryNames, teamNames } = { ...req.query }
        const [ua, ip] = [...getReqHeaders(req)]
        let playerCountry, playerTeam

        const nameParts = playerName.split(' ')
        const firstName = nameParts.shift()
        const secondName = nameParts.join(' ')

        const query = {
            $or: [
                {
                    // Case 1: fullName matches (first name + second name)
                    first_name: { $regex: `^${diacriticSensitiveRegex(firstName)}$`, $options: 'i' },
                    second_name: { $regex: `^${diacriticSensitiveRegex(secondName)}$`, $options: 'i' }
                },
                {
                    // Case 2: fullName is part of the second name
                    second_name: { $regex: `^${diacriticSensitiveRegex(playerName)}$`, $options: 'i' }
                },
            ]
        }

        if (playerName !== '') {
            await Player.find(query)
                .then(playerData => {
                    const possiblePlayers = []

                    playerData.map(player => {
                        playerCountry = countryNames.find(c => c.includes(player.country))
                        if (playerCountry) playerTeam = teamNames.find(t => t.includes(player.team))
                        if (playerCountry && playerTeam) {
                            const editedPlayer = { team: playerTeam, country: playerCountry, imgPath: player.imgPath.trim(), first_name: player.first_name, secondName: player.second_name }
                            possiblePlayers.push(editedPlayer)
                        }
                    })
                    const message = possiblePlayers.length ? `${playerName} was successfully found` : `${playerName} doesn't match with the specific parameters`
                    writeLog(message, 'INFO')
                    res.send(possiblePlayers.length ? possiblePlayers : `${playerName} not found, try players from current season`)
                })
                .catch(err => {
                    write.log(`${err} when trying to find ${playerName}`, 'ERROR')
                    res.send('No matches')
                })
        } else {
            const message = `${ip} with UA: ${ua} tryied to find a player with an empty string`
            writeLog(message, 'INFO')
            res.send("Player name is empty, try with player's name")
        }
    },
    async getPlayersByTeam(req, res) {
        const team = req.params['team']
  
        Player.find({ team: team })
            .then(data => {
                const players = data.map(player => [{ name: `${player.first_name} ${player.second_name}`, country: player.country, team: player.team }])
                res.send(players)
            })
            .catch(err => res.send(err))
    },
    async addPlayer(req, res) {
        const { firstName, secondName, imgPath, country, team } = { ...req.body }
        const [ua, ip] = [...getReqHeaders(req)]

        const newPlayer = new Player({
            first_name: firstName,
            second_name: secondName,
            imgPath: imgPath,
            country: country,
            team: team
        })

        await Player.findOne({
            first_name: { $regex: '^' + diacriticSensitiveRegex(firstName) + '$', $options: 'i' },
            second_name: { $regex: '^' + diacriticSensitiveRegex(secondName) + '$', $options: 'i' },
            country: country,
            team: team
        })
            .then(docs => {
                if (docs) {
                    const message = `Request from ${ip}, UA: ${ua} to add ${firstName} ${secondName} was rejected due to already exists in DB`
                    writeLog(message, 'INFO')
                    res.send(`Player ${firstName} ${secondName} already exists in DB`)
                } else {
                    newPlayer
                        .save()
                        .then((docs) => {
                            const message = `Request from ${ip}, UA: ${ua} to add ${firstName} ${secondName} was successfully done`
                            writeLog(message, 'INFO')
                            res.send(`Player ${firstName} ${secondName} was successfully added`)
                        })
                        .catch((err) => {
                            const message = `${err} when trying to add ${firstName} ${secondName} from ${ip}, UA: ${ua}`
                            writeLog(message, 'ERROR')
                            res.sendStatus(400).json(err)
                        });
                }

            })
            .catch(err => {
                const message = `${err} when trying to add ${firstName} ${secondName} from ${ip}, UA: ${ua}`
                writeLog(message, 'ERROR')
            })
    },
    modifyPlayer: async (req, res) => {
        const [ua, ip] = [...getReqHeaders(req)]
        await Player.find({})
            .then(data => {
                data.map(player => {
                    Player.findByIdAndUpdate(player._id, {
                        imgPath: `${player.first_name} ${player.second_name}`
                    })
                        .then(data => {
                            const message = `${player.first_name} ${player.second_name} from ${player.country} was updated successfully by ${ip} with UA: ${ua}`
                            writeLog(message, 'INFO')
                        })
                        .catch(err => {
                            const message = `${err} when trying to modify player ${player.first_name} ${player.second_name} by ${ip} with UA: ${ua}`
                            writeLog(message, 'ERROR')
                        })
                })
                res.send(`Players updated`)
            })
            .catch(err => res.send(err))

    }
}