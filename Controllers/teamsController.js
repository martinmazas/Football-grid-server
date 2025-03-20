const { Team } = require('../DB/Schemas/teamSchema')
const { getTournamentTeams } = require('../Utils/functions')

module.exports = {
    getTeams: async (req, res) => {
        const tournament = req.tournament
        res.status(200).send((await getTournamentTeams(tournament)))
    },
    addTeam: async (req, res) => {
        // If the team is not in the DB, will add it
        const { name, code, url } = { ...req.body }

        Team.findOne({ name })
            .then(data => {
                if (data) {
                    res.send(`${name} already exists in DB`)
                } else {
                    const newTeam = new Team({
                        name: name,
                        code: code,
                        url: url,
                        countries: []
                    }).save()
                        .then(docs => {
                            req.body.team = name
                            console.log(`Team ${name} was successfully added to the DB`)
                            res.status(200).send(`Team ${name} was successfully added to the DB`)
                        })
                        .catch(err => {
                            const message = `${err} when tried to add team ${name}`
                            console.log(message)
                            res.status(400).send(message)
                        })
                }
            })
            .catch(err => res.send(`${err} when trying to add ${name}`))
    },
    removeTeam: (req, res, next) => {
        const { name } = { ...req.body }

        Team.findOneAndDelete({ name })
            .then(team => {
                console.log(`${name} removed successfully`)
                next()
            }
            )
            .catch(err => res.status(400).send(`${err}, when trying to remove ${name}`))
    }
}