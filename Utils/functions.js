const { getCountries } = require('../Controllers/countryController');
const { Player } = require('../DB/Schemas/playerSchema');
const { Team } = require('../DB/Schemas/teamSchema');

let cachedCountries // Variable to store all the countries
let cachedPlayers // Variable to store all the possible players for the specific tournament

const loadInitialData = async () => {
    try {
        cachedCountries = await getCountries() // Get all the possible countries
        console.log('Countries data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

(async () => { await loadInitialData(); })(); // Ensure data is loaded before proceeding

module.exports = {
    // Function used to get random countries/teams (when calling from params)
    getRandomElements: (requiredElements, elements) => {
        const result = new Set();
        const len = elements.length;

        // Get req. elements - 1
        while (result.size < requiredElements - 1) {
            const rand = Math.floor(Math.random() * len);
            result.add(elements[rand])
        }

        return Array.from(result);
    },

    // Get all the possible countries for a specific combination of teams
    getPossibleCountries: (teams) => {
        if (!teams) return [];
        const possibleCountries = teams.flatMap(team => team.countries)
        return possibleCountries.map(country => cachedCountries.get(country))
    },

    getCachedCountries: (randomCountries) => randomCountries.map(country => cachedCountries.get(country)),

    writeLog: async (message, req, type) => {
        const ua = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            console.log(`IP: ${ip}, UA: ${ua}. -> ${message}`);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },
    filterCountriesPerTeam: async (countries, team) => {
        const countriesSet = [...new Set(countries)];

        try {
            await Team.findOneAndUpdate(
                { name: team },
                { $set: { countries: countriesSet } },
                { new: true }
            );
            console.log(`New update on ${team}`);
        } catch (err) {
            console.error(err);
        }
    },
    getTournamentTeams: async (tournament, rows = 1) => {
        cachedPlayers = []
        // Find all the teams of the specific tournament and have at least rows - 1 possible countries
        try {
            const teams = await Team.find({
                tournaments: tournament,
                "$expr": { "$gte": [{ "$size": "$countries" }, rows - 1] }
            }).select('-_id -__v -tournaments')

            // Set the players for the specific tournament
            for (const team of teams) {
                Player.find({ team: team.name }).select('first_name second_name -_id')
                    .then(data => cachedPlayers.push(...data))
                    .catch(err => console.log(err))
            }
            return teams
        } catch (err) { console.log(err) }

    },
    getCachedPlayers: () => { return cachedPlayers },
    normalize: (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
};