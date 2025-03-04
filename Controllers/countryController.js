const Country = require('../DB/Schemas/countrySchema')

module.exports = {
    getCountries: async (req, res) => {
        try {
            const countries = await Country.find({}).select('-_id')
            const formattedCountries = new Map(
                countries.map(({ name, code }) => [name, { name, code }])
            );
            return formattedCountries
        } catch (err) {
            console.error(err);
            throw new Error('Failed to retrieve countries');  // Throw an error so the caller can handle it
        }
    }
}