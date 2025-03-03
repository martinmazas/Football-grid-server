const { getRandomElements, getFinalResult, writeLog, getCachedTeams, getPossibleCountries } = require('../Utils/functions')
require('dotenv').config()
let teams
const totalRequestedPlayers = process.env.REQUESTED_PLAYERS
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        const tournament = req.tournament
        teams = getCachedTeams(tournament)

        try {
            // Initialize the variables
            let playerNumbers = 0;
            let randomCountries, randomTeams

            // Loop until the required number of players is reached
            while (playerNumbers < totalRequestedPlayers) {
                randomTeams = getRandomElements(rows, teams);  // Get random teams
                const allPossibleCountries = randomTeams.flatMap(team => getPossibleCountries(team.name, tournament))
                
                if (allPossibleCountries.length >= rows - 1) {
                    randomCountries = getRandomElements(columns, allPossibleCountries); // Get random countries

                    // Calculate the final result
                    playerNumbers = getFinalResult(randomCountries, randomTeams, tournament);
                }
            }

            const message = `New game, Teams: ${randomTeams.map(team => team.name)}, Countries: ${randomCountries.map(country => country.name)}`;
            writeLog(message, req, 'INFO');
            randomTeams = randomTeams.flatMap(team => [{ name: team.name, code: team.code, url: team.url }])

            res.status(200).send({
                rows,
                columns,
                randomTeams,
                randomCountries,
                playerNumbers,
            });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, req, 'ERROR');
            res.status(500).send({ err: 'Failed to fetch game parameters' });
        }
    }
}