const { ChampionsLeagueTeam, CopaLibertadoresTeam, MLSTeam, EuropeLeagueTeam } = require('../DB/Schemas/teamSchema');
const { ChampionsLeaguePlayer, CopaLibertadoresPlayer, MLSPlayer, EuropeLeaguePlayer } = require('../DB/Schemas/playerSchema');
const { getCountries } = require('../Controllers/countryController');

// Constants for tournament types
const TOURNAMENTS = {
    CHAMPIONS_LEAGUE: 'CHAMPIONS LEAGUE',
    LIBERTADORES: 'LIBERTADORES',
    MLS: 'MLS',
    EUROPE_LEAGUE: 'EUROPE LEAGUE'
};

let cachedCountries // Variable to store all the countries

const setTournamentParam = (tournament, type) => {
    switch (tournament) {
        case TOURNAMENTS.CHAMPIONS_LEAGUE:
            if (type === 'player') return ChampionsLeaguePlayer
            else if (type === 'team') return ChampionsLeagueTeam.find({}).select('-_id -__v') 
        case TOURNAMENTS.LIBERTADORES:
            if (type === 'player') return CopaLibertadoresPlayer
            else if (type === 'team') return CopaLibertadoresTeam.find({}).select('-_id -__v') 
        case TOURNAMENTS.MLS:
            if (type === 'player') return MLSPlayer
            else if (type === 'team') return MLSTeam.find({}).select('-_id -__v') 
        case TOURNAMENTS.EUROPE_LEAGUE:
            if (type === 'player') return EuropeLeaguePlayer
            else if (type === 'team') return EuropeLeagueTeam.find({}).select('-_id -__v') 
        default:
            console.log('Problems with the tournament')
    }
}

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

    getFinalResult: (randomCountries, randomTeams) => {
        return randomTeams.reduce((playersNumber, team) => {
            return playersNumber + randomCountries.reduce((count, country) => {
                try {
                    if (team.countries.includes(country.name)) {
                        return count + 1;
                    }
                } catch (err) {
                    console.log(`${err} when trying to get one of the countries`);
                }
                return count;
            }, 0);
        }, 0);
    },

    writeLog: async (message, req, type) => {
        const ua = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        try {
            console.log(`New request, IP: ${ip}, UA: ${ua}. -> ${message}`);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },

    getTournamentPlayers: (tournament) => setTournamentParam(tournament, 'player'),
    getTournamentTeams: async (tournament) => setTournamentParam(tournament, 'team')
};