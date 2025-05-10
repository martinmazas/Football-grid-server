const { getRandomElements, getCachedCountries, writeLog, getPossibleCountries, getTournamentTeams } = require('../Utils/functions')
require('dotenv').config()
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        // Prepare and send the parameters for the game
        let tournament = req.tournament
        console.log('Tournament:', tournament)
        if (tournament === 'AFC CHAMPIONS LEAGUE') tournament = 'AFC'
        
        const teams = await getTournamentTeams(tournament, rows); // Store all the teams of the desire tournament
        try {
            // Initialize the variables
            let randomTeams, randomCountries = [] // Random teams and countries

            // Loop until randomCountries has the same length as columns
            while (randomCountries.length < columns - 1) {
                randomTeams = getRandomElements(rows, teams);  // Get random teams
                const allPossibleCountries = getPossibleCountries(randomTeams) // Get all the possible countries for the selected teams

                // Count for each country how many times it appears (need to appear 3 times in order to be a good option)
                const countPossibleCountries = allPossibleCountries.reduce((acc, country) => {
                    if (country) acc[country.name] = (acc[country.name] || 0) + 1;
                    return acc;
                }, {})

                // Get the possible countries that appears in each team
                const possibleMatchCountries = Object.keys(countPossibleCountries).filter(country => countPossibleCountries[country] === rows - 1);

                if (possibleMatchCountries.length >= rows - 1) {
                    randomCountries =
                        getCachedCountries(possibleMatchCountries.length === rows - 1 ?
                            possibleMatchCountries : getRandomElements(columns, possibleMatchCountries))
                }
            }

            const formattedTeams = randomTeams.map(({ name, code, url }) => ({ name, code, url }));
            const message = `New game in ${tournament}, Teams: ${formattedTeams.map(({ name }) => (name))}, Countries: ${randomCountries.map(country => country.name)}`;
            writeLog(message, req, 'INFO')

            res.status(200).send({
                randomTeams: formattedTeams,
                randomCountries,
            });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, req, 'ERROR')
            res.status(500).send({ err: 'Failed to fetch game parameters' })
        }
    }
}