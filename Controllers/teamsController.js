const { Team } = require('../DB/Schemas/teamSchema')
const { getTournamentTeams } = require('../Utils/functions')

module.exports = {
    getTeams: async (req, res) => {
        const tournament = req.tournament
        res.status(200).send((await getTournamentTeams(tournament)))
    },
    addTeam: async (req, res) => {
        // If the team is not in the DB, will add it
        try {
            const { name, code, url, tournament } = { ...req.body }

            const existingTeam = await Team.findOne({ name })

            if (existingTeam) {
                if (existingTeam.tournaments.includes(tournament)) {
                    return res.status(200).send(`${name} already exists with tournament ${tournament}`);
                }

                await Team.updateOne(
                    { name },
                    { $addToSet: { tournaments: tournament } }
                )

                return res.status(200).send(`Tournament ${tournament} added to ${name}`);
            }

            const newTeam = new Team({
                name,
                code,
                url,
                countries: [],
                tournaments: [tournament]
            })

            await newTeam.save()
            return res.status(200).send(`Team ${name} was successfully added to the DB`);

        } catch (err) {
            return res.status(400).send(`Error: ${err} when trying to add ${name}`);
        }
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