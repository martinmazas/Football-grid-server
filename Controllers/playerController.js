const { ChampionsLeaguePlayer, CopaLibertadoresPlayer } = require('../DB/Schemas/playerSchema')
const { filterCountriesPerTeam, writeLog } = require('../Utils/functions')

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
        // Get all the players and filter the countries in order to fill the countries Array on teams
        const tournament = req.tournament
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer

        try {
            // Players will have country and team
            const players = await TournamentPlayer.find({}).select('country team -_id')
            const message = `Get players called`
            writeLog(message, req, 'INFO')
            res.status(200).send(players)
        } catch (err) {
            const message = `${err} when calling Get players`
            writeLog(message, req, 'ERROR')
            res.status(500).send(err)
        }
    },
    getPlayer: async (req, res) => {
        const tournament = req.tournament
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer

        let { playerName, combinations } = req.query
        combinations = combinations.map(combination => combination.split('grid-place-')[1])

        if (!playerName) {
            const message = `Empty string search`
            writeLog(message, req, 'INFO')
            return res.send("Player name is empty. Please provide a valid player's name.")
        }

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

        try {
            const players = await TournamentPlayer.find(query)
            // const possiblePlayers = players.filter(player => countryNames.find(country => player.country.localeCompare(country) === 0)
            //     && teamNames.find(team => player.team.localeCompare(team) === 0))
            let possiblePlayers = []
            combinations.forEach(combination => {
                const [country, team] = combination.split('-')

                players.forEach(player => {
                    if (player.country === country && player.team === team) possiblePlayers.push(player)
                })
            })
            possiblePlayers = possiblePlayers.flatMap(player => ({
                team: player.team,
                country: player.country,
                imgPath: player.imgPath.trim(),
                first_name: player.first_name,
                second_name: player.second_name
            }))
            // .map(player => ({
            //     team: player.team,
            //     country: player.country,
            //     imgPath: player.imgPath.trim(),
            //     first_name: player.first_name,
            //     secondName: player.second_name,
            // }))

            console.log(possiblePlayers)


            const message = possiblePlayers.length
                ? `${playerName} was successfully found.`
                : `${playerName} doesn't match the specific parameters.`
            writeLog(message, req, 'INFO')
            res.send(possiblePlayers.length ? possiblePlayers : `${playerName} not found.`)
        } catch (err) {
            writeLog(`${err.message} when trying to find ${playerName}`, req, 'ERROR')
            res.send('No matches found.')
        }
    },
    async getPlayersByTeam(req, res) {
        const { team, type } = req.body
        const tournament = req.tournament
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer
        console.log(team, type)

        try {
            const players = await TournamentPlayer.find({ team })

            if (type === 'Compare players') {
                const playerList = players.map(player => ({
                    name: `${player.first_name} ${player.second_name}`,
                    country: player.country,
                    team: player.team,
                    img: player.imgPath
                }))
                // res.status(200).send(playerList)
            } else {
                const countries = players.map(player => player.country);
                filterCountriesPerTeam(countries, team, tournament);
                res.status(200).send(`Countries have been updated for the team ${team}.`);
            }
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addPlayer: async (req, res) => {
        const tournament = req.tournament;
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer;
        const { firstName, secondName, imgPath, country, team } = req.body;

        try {
            const existingPlayer = await TournamentPlayer.findOne({
                first_name: { $regex: `^${diacriticSensitiveRegex(firstName)}$`, $options: 'i' },
                second_name: { $regex: `^${diacriticSensitiveRegex(secondName)}$`, $options: 'i' },
                country,
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
            res.status(201).send(`Player ${firstName} ${secondName} added successfully.`);
        } catch (err) {
            const message = `${err.message} when trying to add ${firstName} ${secondName}`;
            writeLog(message, req, 'ERROR');
            res.status(500).send('Failed to add the player.');
        }
    },
    modifyPlayer: async (req, res) => {
        const tournament = req.tournament
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer

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
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer

        TournamentPlayer.findOneAndDelete({
            first_name: firstName,
            second_name: secondName,
            country: country,
            team: team
        })

            .then((data) => {
                res.status(200).send({
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
        const TournamentPlayer = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeaguePlayer : CopaLibertadoresPlayer

        try {
            TournamentPlayer.deleteMany({ team: name })
                .then(() => console.log(`Players from ${name} were deleted from DB`))
                .catch(err => res.status(400).send(`${err}, when trying to delete multiple players`))
        } catch (err) { res.status(400).send(err) }
    }
}