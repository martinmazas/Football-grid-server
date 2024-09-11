const Data = require('../DB/Schemas/dataSchema')

module.exports = {
    getData: async (req, res) => {
        try {
            const data = await Data.find({}).select('team countries -_id')
            return data
        } catch (err) {
            console.log(err)
        }
    },
    saveData: async (teamCombination) => {
        teamCombination.forEach((val, key) => {
            let team = key
            let countries = [...val.keys()]

            const newTeam = new Data({ team, countries })
                .save()
                .then(() => console.log(`${team} added`))
                .catch((err) => console.log(err))
        })
    }
}