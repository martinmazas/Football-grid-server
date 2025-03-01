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

let cachedCountries = [];
let libertadoresCachedTeams = [];
let championsCachedTeams = [];
let mlsCachedTeams = []
let europeLeagueCachedTeams = []

let libertadoresCombinationLoaded, championsCombinationLoaded, mlsCombinationLoaded, europeLeagueCombinationLoaded
let libertadoresCache, championsCache, mlsCache, europeLeagueCache

const setTournamentParam = (tournament, type) => {
    switch (tournament) {
        case TOURNAMENTS.CHAMPIONS_LEAGUE:
            if (type === 'cache') return championsCache
            else if (type === 'loaded') return championsCombinationLoaded
            else if (type === 'team') return ChampionsLeagueTeam
            else if (type === 'cachedTeam') return championsCachedTeams
            else if (type === 'player') return ChampionsLeaguePlayer
        case TOURNAMENTS.LIBERTADORES:
            if (type === 'cache') return libertadoresCache
            else if (type === 'loaded') return libertadoresCombinationLoaded
            else if (type === 'team') return CopaLibertadoresTeam
            else if (type === 'cachedTeam') return libertadoresCachedTeams
            else if (type === 'player') return CopaLibertadoresPlayer
        case TOURNAMENTS.MLS:
            if (type === 'cache') return mlsCache
            else if (type === 'loaded') return mlsCombinationLoaded
            else if (type === 'team') return MLSTeam
            else if (type === 'cachedTeam') return mlsCachedTeams
            else if (type === 'player') return MLSPlayer
        case TOURNAMENTS.EUROPE_LEAGUE:
            if (type === 'cache') return europeLeagueCache
            else if (type === 'loaded') return europeLeagueCombinationLoaded
            else if (type === 'team') return EuropeLeagueTeam
            else if (type === 'cachedTeam') return europeLeagueCachedTeams
            else if (type === 'player') return EuropeLeaguePlayer
        default:
            console.log('Problems with the tournament')
    }
}

const loadInitialData = async () => {
    try {
        const [libertadoresTeams, championsTeams, mlsTeams, europeLeagueTeams] = await Promise.all([
            CopaLibertadoresTeam.find({}).select('-_id -__v'), ChampionsLeagueTeam.find({}).select('-_id -__v'), MLSTeam.find({}).select('-_id -__v'), EuropeLeagueTeam.find({})
        ]);

        // Cache each tournament teams
        libertadoresCachedTeams = [...libertadoresTeams];
        championsCachedTeams = [...championsTeams];
        mlsCachedTeams = [...mlsTeams]
        europeLeagueCachedTeams = [...europeLeagueTeams]
        cachedCountries = await getCountries()

        console.log('Teams and countries data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

(async () => {
    await loadInitialData(); // Ensure data is loaded before proceeding
    const { libertadores, champions, mls, europeLeague } = await readFromFile()

    libertadoresCombinationLoaded = libertadores;
    championsCombinationLoaded = champions;
    mlsCombinationLoaded = mls
    europeLeagueCombinationLoaded = europeLeague
})();

const readFromFile = async () => {
    if (libertadoresCache && championsCache && mls && europeLeagueCache) {
        return { libertadoresCache, championsCache, mls, europeLeagueCache }
    }

    try {
        libertadoresCache = convertToMap(libertadoresCachedTeams);
        championsCache = convertToMap(championsCachedTeams);
        mlsCache = convertToMap(mlsCachedTeams)
        europeLeagueCache = convertToMap(europeLeagueCachedTeams)

        return { libertadores: libertadoresCache, champions: championsCache, mls: mlsCache, europeLeague: europeLeagueCache };
    } catch (err) {
        console.error('Error reading or parsing file:', err);
        return { libertadoresCache: new Map(), championsCache: new Map(), mlsCache: new Map(), europeLeagueCache: new Map() }; // Return empty Maps on error
    }
}

const convertToMap = (teamsArray) => {
    return teamsArray.reduce((map, teamObj) => {
        return map.set(teamObj.name, new Set(teamObj.countries));
    }, new Map());
}

module.exports = {
    getRandomElements: (requiredElements, elements) => {
        const result = new Map();
        const len = elements.length;

        while (result.size < requiredElements - 1) {
            const rand = Math.floor(Math.random() * len);
            result.set(elements[rand].name, elements[rand]);
        }

        return Array.from(result.values());
    },

    getPossibleCountries: (teamName, tournament) => {
        const dataCache = setTournamentParam(tournament, 'cache');
        const teamData = dataCache.get(teamName);

        if (!teamData) return [];

        return cachedCountries.filter(country => teamData.has(country.name));
    },

    getFinalResult: (randomCountries, randomTeams, tournament) => {
        let playersNumber = 0;
        const teamCombinationLoaded = setTournamentParam(tournament, 'loaded');

        randomTeams.forEach(team => {
            const validCountries = teamCombinationLoaded.get(team.name);
            if (!validCountries) return;

            randomCountries.forEach(country => {
                if (validCountries.has(country.name)) playersNumber++;
            });
        });

        return { playersNumber };
    },

    filterCountriesPerTeam: async (countries, team, tournament) => {
        const countriesSet = [...new Set(countries)];
        const TournamentTeam = setTournamentParam(tournament, 'team');

        try {
            await TournamentTeam.findOneAndUpdate(
                { name: team },
                { $set: { countries: countriesSet } },
                { new: true }
            );
            console.log(`New update on ${team}`);
        } catch (err) {
            console.error(err);
        }
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

    getCachedTeams: (tournament) => setTournamentParam(tournament, 'cachedTeam'),
    setTournament: (tournament) => setTournamentParam(tournament, 'team'),
    getTournamentPlayers: (tournament) => setTournamentParam(tournament, 'player')
};