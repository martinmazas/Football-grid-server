const { getCountries } = require('../Controllers/countryController');
const { ChampionsLeagueTeam, CopaLibertadoresTeam, MLSTeam, EuropeLeagueTeam } = require('../DB/Schemas/teamSchema');
const { ChampionsLeaguePlayer, CopaLibertadoresPlayer, MLSPlayer, EuropeLeaguePlayer } = require('../DB/Schemas/playerSchema');

// Constants for tournament types
const TOURNAMENTS = {
    CHAMPIONS_LEAGUE: 'CHAMPIONS LEAGUE',
    LIBERTADORES: 'LIBERTADORES',
    MLS: 'MLS',
    EUROPE_LEAGUE: 'EUROPE LEAGUE'
};

let cachedCountries // Variable to store all the countries
let libertadoresCombinationLoaded, championsCombinationLoaded, mlsCombinationLoaded, europeLeagueCombinationLoaded
let libertadoresCache, championsCache, mlsCache, europeLeagueCache

const setTournamentParam = (tournament, type) => {
    switch (tournament) {
        case TOURNAMENTS.CHAMPIONS_LEAGUE:
            if (type === 'cache') return championsCache
            else if (type === 'loaded') return championsCombinationLoaded
            else if (type === 'player') return ChampionsLeaguePlayer
        case TOURNAMENTS.LIBERTADORES:
            if (type === 'cache') return libertadoresCache
            else if (type === 'loaded') return libertadoresCombinationLoaded
            else if (type === 'player') return CopaLibertadoresPlayer
        case TOURNAMENTS.MLS:
            if (type === 'cache') return mlsCache
            else if (type === 'loaded') return mlsCombinationLoaded
            else if (type === 'player') return MLSPlayer
        case TOURNAMENTS.EUROPE_LEAGUE:
            if (type === 'cache') return europeLeagueCache
            else if (type === 'loaded') return europeLeagueCombinationLoaded
            else if (type === 'player') return EuropeLeaguePlayer
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
    getTournamentTeams: async (tournament) => {
        if (tournament === TOURNAMENTS.CHAMPIONS_LEAGUE) return await ChampionsLeagueTeam.find({}).select('-_id -__v');
        if (tournament === TOURNAMENTS.LIBERTADORES) return await CopaLibertadoresTeam.find({}).select('-_id -__v');
        if (tournament === TOURNAMENTS.MLS) return await MLSTeam.find({}).select('-_id -__v');
        if (tournament === TOURNAMENTS.EUROPE_LEAGUE) return await EuropeLeagueTeam.find({}).select('-_id -__v');
    }
};