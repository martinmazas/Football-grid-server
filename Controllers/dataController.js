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
    saveData: async (req, res) => {
        const { country, team } = { ...req.body }
        Data.findOneAndUpdate({ team }, { $addToSet: { countries: country } }, { new: true })
            .then(data => {
                console.log(data.countries)
            })
            .catch(err => console.log(err))
    },
    removeData: async (req, res) => {
        const {country, team} = {...req.body}
        console.log(`In remove ${country} ${team}`)
    },
    saveAll: async (teamCombination) => {
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