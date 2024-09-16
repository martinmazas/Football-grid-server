const Team = require('../DB/Schemas/teamSchema')
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
    addTeam: async (req, res) => {
        // If the team is not in the DB, will add it (countries will be empty)
        const { name, code, url } = { ...req.body }
        // const [ua, ip] = [...getReqHeaders(req)]

        Team.findOne({ name })
            .then(data => {
                console.log(data, name)
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
                            // const message = `Team ${name} was successfully added to the DB by ${ip} with UA: ${ua}`
                            // writeLog(message, 'INFO')
                            res.send(`Team ${name} was successfully added to the DB`)
                        })
                        .catch(err => {
                            const message = `${err} when ${ip} with UA: ${ua} tried to add team ${name}`
                            // writeLog(message, 'ERROR')
                            console.log(message)
                        })
                }
            })
            .catch(err => res.send(`${err} when trying to add ${name}`))
    }
}