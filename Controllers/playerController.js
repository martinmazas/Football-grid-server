const { filterCountriesPerTeam, writeLog, getTournamentPlayers } = require('../Utils/functions')

const diacriticSensitiveRegex = (string = '') => {
    return string
        .replace(/a/g, '[a,á,à,ä,â]')
        .replace(/A/g, '[A,a,á,à,ä,â]')
        .replace(/e/g, '[e,é,ë,è,ê,ę]')
        .replace(/E/g, '[E,e,é,ë,è,ę]')
        .replace(/i/g, '[i,í,ï,ì]')
        .replace(/I/g, '[I,i,í,ï,ì]')
        .replace(/o/g, '[o,ó,ö,ò]')
        .replace(/O/g, '[O,o,ó,ö,ò,ø]')
        .replace(/u/g, '[u,ü,ú,ù]')
        .replace(/U/g, '[U,u,ü,ú,ù]')
        .replace(/n/g, '[ñ,ń,ņ,ň,n]')
        .replace(/N/g, '[Ñ,Ń,Ņ,Ň,N]')
        .replace(/Z/g, '[Ź,Ž,Ż,Z]')
        .replace(/z/g, '[ź,ž,ż,z]')
        .replace(/c/g, '[ç,ć,č,ċ,c]')
        .replace(/C/g, '[Ç,Ć,Č,Ċ,C]')
}

module.exports = {
    getPlayers: async (req, res) => {
        // Get all the players for the specific tournament and filter the countries in order to fill the countries Array on teams
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)
        const params = req.body.params || 'country team -_id'

        try {
            // Players will have country and team
            const players = await TournamentPlayer.find({}).select(params)
            const message = `Get players called`
            writeLog(message, req, 'INFO')
            res.status(200).send(players)
        } catch (err) {
            const message = `${err} when calling Get players`
            writeLog(message, req, 'ERROR')
            res.status(500).send(err)
        }
    },
    guessPlayer: async (req, res) => {
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)
        let { playerName, combinations } = req.query
        if (!playerName) return res.send("Player name is empty. Please provide a valid player's name.")

        const nameParts = playerName.split(' ')
        const firstName = nameParts.shift()
        const secondName = nameParts.join(' ')

        query = {
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
                {
                    second_name: { $regex: `^${diacriticSensitiveRegex(secondName.split(' ')[1])}$`, $options: 'i' }
                }
            ]
        }

        try {
            await TournamentPlayer.find(query).select('-_id -__v')
                .then(data => {
                    const player = data.filter(playerData => {
                        return combinations.includes(`${playerData.country}-${playerData.team}`)
                    })

                    if (player.length > 0) {
                        res.status(200).send(...player)
                    } else res.send('Player not found')
                }).catch(err => {
                    console.log(err)
                })
        } catch (err) {
            console.log(err)
        }
    },
    getPlayerOptions: async (req, res) => {
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)
        let { playerName } = req.query

        if (!playerName) {
            const message = `Empty string search`
            writeLog(message, req, 'INFO')
            return res.send("Player name is empty. Please provide a valid player's name.")
        }

        const regex = new RegExp(`^${diacriticSensitiveRegex(playerName)}`, "i"); // "Starts with" regex (case-insensitive)
        query = {
            $or: [
                { first_name: regex }, // Starts with first_name
                { second_name: regex }, // Starts with second_name
                { $expr: { $regexMatch: { input: { $concat: ["$first_name", " ", "$second_name"] }, regex: `^${playerName}`, options: "i" } } }, // Starts with full name
            ],
        }
        try {
            const players = await TournamentPlayer.find(query).select('first_name second_name -_id')
            res.json(players)
        } catch (err) {
            console.log(err)
        }
    },
    async getPlayersByTeam(req, res) {
        const { team, type } = req.body
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)

        try {
            const players = await TournamentPlayer.find({ team })

            if (type === 'Compare players') {
                const playerList = players.map(player => ({
                    name: `${player.first_name} ${player.second_name}`,
                    country: player.country,
                    team: player.team,
                    img: player.imgPath
                }))
                res.status(200).send(playerList)
            } else {
                const countries = players.map(player => player.country);
                filterCountriesPerTeam(countries, team, tournament);
                res.status(200).send(`Countries have been updated for the team ${team}.`);
            }
        } catch (err) {
            console.log(err)
            // res.status(500).send(err);
        }
    },
    getPlayerByImgPath: async (req, res) => {
        const tournament = req.tournament
        const imgPath = req.params.imgPath.trim()
        const name = imgPath.split(' ').join(' ')
        const TournamentPlayer = getTournamentPlayers(tournament)

        TournamentPlayer.findOne({ imgPath: new RegExp(`^\\s*${imgPath}\\s*$`, 'i') }).select('first_name second_name country team imgPath -_id')
            .then(data => {
                if (data) {
                    res.status(200).send(`${data} found in ${tournament} DB`)
                } else {
                    res.status(404).send(`${name} not found in ${tournament} DB`)
                }
            }).catch(err => res.status(500).send(err))
    },
    addPlayer: async (req, res, next) => {
        const tournament = req.tournament;
        const TournamentPlayer = getTournamentPlayers(tournament)
        const { firstName, secondName, imgPath, country, team } = req.body;

        try {
            const existingPlayer = await TournamentPlayer.findOne({
                first_name: { $regex: `^${diacriticSensitiveRegex(firstName)}$`, $options: 'i' },
                second_name: { $regex: `^${diacriticSensitiveRegex(secondName)}$`, $options: 'i' },
                country,
                team
            });

            if (existingPlayer) {
                const message = `Request to add ${firstName} ${secondName} was rejected. Player already exists in DB.`;
                writeLog(message, req, 'INFO');
                return res.status(400).send(`Player ${firstName} ${secondName} already exists in the DB.`);
            }

            const newPlayer = new TournamentPlayer({
                first_name: firstName,
                second_name: secondName,
                imgPath: imgPath.trim(),
                country,
                team,
            });

            await newPlayer.save();
            console.log(`Player ${firstName} ${secondName} added successfully.`);
            next()
        } catch (err) {
            const message = `${err.message} when trying to add ${firstName} ${secondName}`;
            writeLog(message, req, 'ERROR');
            console.log('Failed to add the player.');
        }
    },
    modifyPlayer: async (req, res) => {
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)

        await TournamentPlayer.find({})
            .then(data => {
                data.map(player => {
                    TournamentPlayer.findByIdAndUpdate(player._id, {
                        imgPath: `${player.first_name} ${player.second_name}`
                    })
                        .then(data => {
                            const message = `${player.first_name} ${player.second_name} from ${player.country} was updated successfully`
                            writeLog(message, req, 'INFO')
                        })
                        .catch(err => {
                            const message = `${err} when trying to modify player ${player.first_name} ${player.second_name}`
                            writeLog(message, req, 'ERROR')
                        })
                })
                res.send(`Players updated`)
            })
            .catch(err => res.send(err))
    },
    deletePlayer: (req, res, next) => {
        const { firstName, secondName, country, team } = { ...req.body }
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)

        TournamentPlayer.findOneAndDelete({
            first_name: firstName,
            second_name: secondName,
            country: country,
            team: team
        })

            .then((data) => {
                console.log({
                    response: `Player ${firstName} ${secondName} deleted successfully`,
                    path: data.imgPath
                })
                next()
            })
            .catch(err => res.send(err))
    },
    deletePlayerByTeam: (req, res) => {
        const { name } = req.body
        const tournament = req.tournament
        const TournamentPlayer = getTournamentPlayers(tournament)

        try {
            TournamentPlayer.deleteMany({ team: name })
                .then((players) => res.status(200).send(`Players from ${name} were deleted from DB, ${players}`))
                .catch(err => res.status(400).send(`${err}, when trying to delete multiple players`))
        } catch (err) { res.status(400).send(err) }
    }
}