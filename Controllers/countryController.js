const Country = require('../DB/Schemas/countrySchema')

module.exports = {
    getCountries: async (req, res) => {
        try {
            const countries = await Country.find({})
            return countries
        } catch (err) {
            console.error(err);
            throw new Error('Failed to retrieve countries');  // Throw an error so the caller can handle it
        }
    }
}