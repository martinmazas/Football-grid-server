const Team = require('../DB/Schemas/teamSchema')
const { getReqHeaders, writeLog } = require('../Utils/functions')

module.exports = {
    getTeams: async (req, res) => {
        const [ua, ip] = [...getReqHeaders(req)]

        const teams = []
        await Team.find({})
            .then(data => data.map(team => teams.push(team)))
            .catch(err => {
                const message = `${err} when ${ip} with UA: ${ua} tried to use Get teams function`
                writeLog(message, 'ERROR')
            })

        const message = `Get teams function used by ${ip} with UA: ${ua}`
        writeLog(message, 'INFO')
        return teams
    },
    addTeam: async (req, res) => {
        const { name, code, url } = { ...req.body }
        const [ua, ip] = [...getReqHeaders(req)]

        const newTeam = new Team({
            name: name,
            code: code,
            url: url
        }).save()
            .then(docs => {
                const message = `Team ${name} was successfully added to the DB by ${ip} with UA: ${ua}`
                writeLog(message, 'INFO')
                res.send(`Team ${name} was successfully added to the DB`)
            })
            .catch(err => {
                const message = `${err} when ${ip} with UA: ${ua} tried to add team ${team}`
                writeLog(message, 'ERROR')
            })
    }
}