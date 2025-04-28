const { Player } = require('../DB/Schemas/playerSchema')
const { filterCountriesPerTeam, writeLog, getCachedPlayers, normalize } = require('../Utils/functions')

module.exports = {
    getPlayers: async (req, res) => {
        // Get all the players. Can be filtered by country and team
        const params = req.body.params || 'country team -_id'

        try {
            // Players will have country and team
            const players = await Player.find({}).select(params)
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
        let { playerName, combinations } = req.query
        if (!playerName) return res.send("Player name is empty. Please provide a valid player's name.")

        const normalizedPlayerName = normalize(playerName).toLowerCase();
        const nameParts = normalizedPlayerName.split(' ')
        const firstName = nameParts.shift()
        const secondName = nameParts.join(' ')

        const query = {
            $or: [
                {
                    first_name: { $regex: `^${firstName}$`, $options: 'i' },
                    second_name: { $regex: `^${secondName}$`, $options: 'i' }
                },
                {
                    second_name: { $regex: `^${normalizedPlayerName}$`, $options: 'i' }
                },
                {
                    second_name: { $regex: `^${secondName.split(' ')[1]}$`, $options: 'i' }
                }
            ]
        };

        try {
            await Player.find(query).select('-_id -__v')
                .then(data => {
                    const player = data.filter(playerData => {
                        const fullName = `${playerData.first_name} ${playerData.second_name}`;
                        const normalizedFullName = normalize(fullName).toLowerCase();
                        return combinations.includes(`${playerData.country}-${playerData.team}`) &&
                            normalizedFullName === normalizedPlayerName;
                    })
                    if (player.length >= 1) {
                        const message = `${player.length > 1 ? 'Multiple' : 'One'} players found for ${playerName}`
                        writeLog(message, req, 'INFO')
                        res.status(200).send(player)
                    }
                    else res.send('Player not found')
                }).catch(err => {
                    writeLog(err, req, 'ERROR')
                    console.log(err)
                })
        } catch (err) {
            console.log(err)
        }
    },
    getPlayerOptions: async (req, res) => {
        try {
            const { playerName } = req.query
            const cachedPlayers = await getCachedPlayers()

            if (!cachedPlayers || cachedPlayers.length === 0) {
                const message = 'No players found in the cache'
                writeLog(message, req, 'INFO')
                return res.status(404).send(message)
            }

            const normalizedPlayerName = normalize(playerName).toLowerCase();

            const filteredPlayers = cachedPlayers.filter(({ first_name, second_name }) => {
                const fullName = `${first_name} ${second_name}`.toLowerCase();
                const fullNameParts = fullName.split(' ');

                const inputParts = normalizedPlayerName.split(' ');

                return inputParts.every(inputPart =>
                    fullNameParts.some(namePart => namePart.startsWith(inputPart))
                );
            });

            return res.status(200).json(filteredPlayers)

        } catch (err) {
            console.error("Error in getPlayerOptions:", err);
            return res.status(500).json({ error: "Server error in getPlayerOptions." });
        }
    },
    async getPlayersByTeam(req, res) {
        // Get all the players by team. Can be for compare or to update the countries Array
        const { team, type } = req.body

        try {
            await Player.find({ team: team })
                .then(data => {
                    if (type === 'Compare players') {
                        const playerList = data.map(player => ({
                            name: `${player.first_name} ${player.second_name}`,
                            country: player.country,
                            team: player.team,
                            img: player.imgPath
                        }))
                        res.status(200).send(playerList)
                    } else {
                        const countries = data.map(player => player.country);
                        filterCountriesPerTeam(countries, team);
                        res.status(200).send(`Countries have been updated for the team ${team}.`);
                    }
                })
                .catch(err => console.log(err))

        } catch (err) {
            console.log(err)
        }
    },
    getPlayerByImgPath: async (req, res) => {
        const imgPath = req.params.imgPath.trim()
        const name = imgPath.split(' ').join(' ')

        Player.findOne({ imgPath: new RegExp(`^\\s*${imgPath}\\s*$`, 'i') }).select('first_name second_name country team imgPath -_id')
            .then(data => {
                if (data) {
                    res.status(200).send(`${data} found in DB`)
                } else {
                    res.status(404).send(`${name} not found in DB`)
                }
            }).catch(err => res.status(500).send(err))
    },
    addPlayer: async (req, res, next) => {
        const { firstName, secondName, imgPath, country, team } = req.body;

        try {
            const normalizedFirstName = normalize(firstName);
            const normalizedSecondName = normalize(secondName);

            const existingPlayer = await Player.findOne({
                first_name: { $regex: `^${normalizedFirstName}$`, $options: 'i' },
                second_name: { $regex: `^${normalizedSecondName}$`, $options: 'i' },
                country,
                team
            });

            if (existingPlayer) {
                const message = `Request to add ${firstName} ${secondName} was rejected. Player already exists in DB.`;
                writeLog(message, req, 'INFO');
                return res.status(400).send(`Player ${firstName} ${secondName} already exists in the DB.`);
            }

            const newPlayer = new Player({
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
        await Player.find({})
            .then(data => {
                data.map(player => {
                    Player.findByIdAndUpdate(player._id, {
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
        Player.findOneAndDelete({
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

        try {
            Player.deleteMany({ team: name })
                .then((players) => res.status(200).send(`Players from ${name} were deleted from DB, ${players}`))
                .catch(err => res.status(400).send(`${err}, when trying to delete multiple players`))
        } catch (err) { res.status(400).send(err) }
    }
}