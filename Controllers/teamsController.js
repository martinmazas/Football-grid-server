const Team = require('../DB/Schemas/teamSchema')

module.exports = {
    getTeams: async (req, res) => {
        const teams = []
        await Team.find({})
            .then(data => data.map(team => teams.push(team)))
            .catch(err => console.log(err))

        return teams
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