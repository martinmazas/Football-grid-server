const { getRandomElements, getCachedCountries, writeLog, getPossibleCountries, getTournamentTeams } = require('../Utils/functions')
require('dotenv').config()
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        const tournament = req.tournament
        const teams = await getTournamentTeams(tournament) // Store all the teams of the desire tournament

        try {
            // Initialize the variables
            let randomTeams, randomCountries = [] // Random teams and countries

            // Loop until randomCountries has the same length as columns
            while (randomCountries.length < columns - 1) {
                randomTeams = getRandomElements(rows, teams);  // Get random teams
                const allPossibleCountries = getPossibleCountries(randomTeams) // Get all the possible countries for the selected teams

                // Count for each country how many times it appears (need to appear 3 times in order to be a good option)
                const countPossibleCountries = allPossibleCountries.reduce((acc, country) => {
                    acc[country.name] = (acc[country.name] || 0) + 1;
                    return acc;
                }, {})

                // Get the possible countries that appears in each team
                const possibleMatchCountries = Object.keys(countPossibleCountries).filter(country => countPossibleCountries[country] === rows - 1);
                if (possibleMatchCountries.length >= rows - 1) {
                    randomCountries = getRandomElements(columns, possibleMatchCountries)
                    randomCountries = getCachedCountries(randomCountries)
                }
            }

            const message = `New game, Teams: ${randomTeams.map(team => team.name)}, Countries: ${randomCountries.map(country => country.name)}`;
            writeLog(message, req, 'INFO')
            randomTeams = randomTeams.flatMap(team => [{ name: team.name, code: team.code, url: team.url }])

            res.status(200).send({
                rows,
                columns,
                randomTeams,
                randomCountries,
            });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, req, 'ERROR')
            res.status(500).send({ err: 'Failed to fetch game parameters' })
        }
    }
}