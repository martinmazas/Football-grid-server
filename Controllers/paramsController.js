const { getRandomNumbers, getFinalResult, writeLog, getReqHeaders, getCachedTeams, getPossibleCountries } = require('../Utils/functions')
require('dotenv').config()
let teams
const requestedNumber = process.env.REQUESTED_PLAYERS
const rows = process.env.ROWS
const columns = process.env.COLUMNS

module.exports = {
    getParams: async (req, res) => {
        const tournament = req.tournament
        teams = getCachedTeams(tournament)
        try {
            const [ua, ip] = [...getReqHeaders(req)];
            const tournament = req.tournament

            // Initialize the variables
            let playerNumbers = 0;
            const noPossiblePlayers = [];
            let randomCountries = [];
            let randomTeams = [];

            // Loop until the required number of players is reached
            while (playerNumbers < requestedNumber) {
                randomTeams = getRandomNumbers(rows, teams);  // Get random teams
                let allCountries = [];

                randomTeams.forEach(team => {
                    const possibleCountries = getPossibleCountries(team.name, tournament);
                    allCountries = [...allCountries, ...possibleCountries]; // Merge countries
                });

                if (allCountries.length > rows - 1) {
                    randomCountries = getRandomNumbers(columns, allCountries); // Get random countries

                    // Calculate the final result
                    const { playersNumber, noPossiblePlayersMatch } = getFinalResult(randomCountries, randomTeams, tournament);

                    // Check the unmatched combinations
                    if (playersNumber >= requestedNumber) {
                        noPossiblePlayers.push(...noPossiblePlayersMatch);  // Append unmatched players
                    }

                    playerNumbers = playersNumber; // Update player numbers
                }
            }

            const message = `New parameters requested from ${ip}, UA: ${ua}, Teams: ${randomTeams.map(team => team.name)}, Countries: ${randomCountries.map(country => country.name)}`;
            writeLog(message, 'INFO');

            res.status(200).send({
                rows,
                columns,
                randomTeams,
                randomCountries,
                playerNumbers,
                noPossiblePlayers
            });
        } catch (err) {
            writeLog(`Error fetching params: ${err.message}`, 'ERROR');
            res.status(500).send({ err: 'Failed to fetch game parameters' });
        }
    }
}