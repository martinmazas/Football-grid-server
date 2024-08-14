const Team = require('../DB/Schemas/teamSchema')

module.exports = {
    getTeams: async (req, res) => {
        Team.find({})
            .then(data => console.log(data))
            .catch(err => console.log(err))
    },
    addTeam: async (req, res) => {
        const { name, code, url } = { ...req.body }
        const newTeam = new Team({
            name: name,
            code: code,
            url: url
        }).save()
        .then(docs => res.send(`Team ${name} was successfully added to the DB`))
        .catch(err => res.send(`${err}`))
    }
}