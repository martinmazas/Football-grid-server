const { getRandomElements, getFinalResult, writeLog, getPossibleCountries, getTournamentTeams } = require('../Utils/functions')
require('dotenv').config()
const totalRequestedPlayers = process.env.REQUESTED_PLAYERS
const rows = process.env.ROWS
const columns = process.env.COLUMNS
let teams

module.exports = {
    getParams: async (req, res) => {
        const tournament = req.tournament
        teams = await getTournamentTeams(tournament) // Store all the teams of the desire tournament

        try {
            // Initialize the variables
            let playerNumbers = 0 // number of players to be returned
            let randomCountries, randomTeams // Teams and Countries

            // Loop until the required number of players is reached. Catch new teams and countries in each iteration
            while (playerNumbers < totalRequestedPlayers) {
                randomTeams = getRandomElements(rows, teams);  // Get random teams
                const allPossibleCountries = getPossibleCountries(randomTeams) // Get all the possible countries for the selected teams

                // Need at least rows - 1 countries
                if (allPossibleCountries.length >= rows - 1) {
                    randomCountries = getRandomElements(columns, allPossibleCountries); // Get random countries

                    // Calculate the final result
                    playerNumbers = getFinalResult(randomCountries, randomTeams);
                }
            }

            randomTeams = randomTeams.flatMap(team => [{ name: team.name, code: team.code, url: team.url }])
            const message = `New game, Teams: ${randomTeams.map(team => team.name)}, Countries: ${randomCountries.map(country => country.name)}`;
            writeLog(message, req, 'INFO')

            res.status(200).send({
                rows,
                columns,
                randomTeams,
                randomCountries,
                playerNumbers,
            });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, req, 'ERROR')
            res.status(500).send({ err: 'Failed to fetch game parameters' })
        }
    }
}