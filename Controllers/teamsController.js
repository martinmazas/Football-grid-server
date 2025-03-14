const { ChampionsLeagueTeam, CopaLibertadoresTeam, MLSTeam, EuropeLeagueTeam } = require('../DB/Schemas/teamSchema')
const { setTournament } = require('../Utils/functions')

module.exports = {
    getTeams: async (req, res) => {
        // Return all the teams with it's attributes
        try {
            const libertadoresTeams = await CopaLibertadoresTeam.find({}).select('-_id -__v')
            const championsTeams = await ChampionsLeagueTeam.find({}).select('-_id -__v')
            const mlsTeams = await MLSTeam.find({}).select('-_id -__v')
            const europeLeague = await EuropeLeagueTeam.find({}).select('-_id -__v')

            return { libertadoresTeams, championsTeams, mlsTeams, europeLeague }
        } catch (err) {
            console.log(err);
            throw new Error('Failed to retrieve teams');  // Throw an error so the caller can handle it
        }
    },
    addTeam: async (req, res, next) => {
        // If the team is not in the DB, will add it
        const tournament = req.tournament
        let TournamentTeam = setTournament(tournament)
        const { name, code, url } = { ...req.body }

        TournamentTeam.findOne({ name })
            .then(data => {
                if (data) {
                    res.send(`${name} already exists in DB`)
                } else {
                    const newTeam = new TournamentTeam({
                        name: name,
                        code: code,
                        url: url,
                        countries: []
                    }).save()
                        .then(docs => {
                            req.body.team = name
                            // const message = `Team ${name} was successfully added to the DB by ${ip} with UA: ${ua}`
                            // writeLog(message, 'INFO')
                            console.log(`Team ${name} was successfully added to the DB`)
                            res.status(200).send(`Team ${name} was successfully added to the DB`)
                        })
                        .catch(err => {
                            const message = `${err} when tried to add team ${name}`
                            // writeLog(message, 'ERROR')
                            console.log(message)
                            res.status(400).send(message)
                        })
                }
            })
            .catch(err => res.send(`${err} when trying to add ${name}`))
    },
    removeTeam: (req, res, next) => {
        const { name } = { ...req.body }
        const tournament = req.tournament
        let TournamentTeam = setTournament(tournament)

        TournamentTeam.findOneAndDelete({ name })
            .then(team => {
                console.log(`${name} removed successfully`)
                // res.status(200).send(`${name} removed successfully`)
                next()
            }
            )
            .catch(err => res.status(400).send(`${err}, when trying to remove ${name}`))
    }
}