const { Team } = require('../DB/Schemas/teamSchema')
// const { getReqHeaders, writeLog } = require('../Utils/functions')

module.exports = {
    getTeams: async (req, res) => {
        // Return all the teams with it's attributes
        try {
            const teams = await Team.find({}).select('-_id -__v')
            return teams
        } catch (err) {
            console.error(err);
            throw new Error('Failed to retrieve teams');  // Throw an error so the caller can handle it
        }
    },
    addTeam: async (req, res, next) => {
        // If the team is not in the DB, will add it
        const { name, code, url } = { ...req.body }
        // const [ua, ip] = [...getReqHeaders(req)]

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
                            // const message = `Team ${name} was successfully added to the DB by ${ip} with UA: ${ua}`
                            // writeLog(message, 'INFO')
                            res.send(`Team ${name} was successfully added to the DB`)
                            // Set the countries
                            next()
                        })
                        .catch(err => {
                            const message = `${err} when ${ip} with UA: ${ua} tried to add team ${name}`
                            // writeLog(message, 'ERROR')
                            console.log(message)
                        })
                }
            })
            .catch(err => res.send(`${err} when trying to add ${name}`))
    },
    removeTeam: (req, res, next) => {
        const { name } = { ...req.body }
        Team.findOneAndDelete({ name })
            .then(team => {
                res.status(200).send(`${name} removed successfully`)
                next()
            }
            )
            .catch(err => res.status(400).send(`${err}, when trying to remove ${name}`))
    }
}