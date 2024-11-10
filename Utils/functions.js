const { getTeams } = require('../Controllers/teamsController');
const { getCountries } = require('../Controllers/countryController');
const { ChampionsLeagueTeam, CopaLibertadoresTeam, MLSTeam } = require('../DB/Schemas/teamSchema');
const { ChampionsLeaguePlayer, CopaLibertadoresPlayer, MLSPlayer } = require('../DB/Schemas/playerSchema');

// Constants for tournament types
const TOURNAMENTS = {
    CHAMPIONS_LEAGUE: 'CHAMPIONS LEAGUE',
    LIBERTADORES: 'COPA LIBERTADORES',
    MLS: 'MLS'
};

const setTournamentParam = (tournament, type) => {
    switch (tournament) {
        case TOURNAMENTS.CHAMPIONS_LEAGUE:
            if (type === 'cache') return championsCache
            else if (type === 'loaded') return championsCombinationLoaded
            else if (type === 'team') return ChampionsLeagueTeam
            else if (type === 'cachedTeam') return championsCachedTeams
            else if(type === 'player') return ChampionsLeaguePlayer
        case TOURNAMENTS.LIBERTADORES:
            if (type === 'cache') return libertadoresCache
            else if (type === 'loaded') return libertadoresCombinationLoaded
            else if (type === 'team') return CopaLibertadoresTeam
            else if (type === 'cachedTeam') return libertadoresCachedTeams
            else if(type === 'player') return CopaLibertadoresPlayer
        case TOURNAMENTS.MLS:
            if (type === 'cache') return mlsCache
            else if (type === 'loaded') return mlsCombinationLoaded
            else if (type === 'team') return MLSTeam
            else if (type === 'cachedTeam') return mlsCachedTeams
            else if(type === 'player') return MLSPlayer
        default:
            console.log('Problems with the tournament')
    }
}

let cachedCountries = [];
let libertadoresCachedTeams = [];
let championsCachedTeams = [];
let mlsCachedTeams = []

let libertadoresCombinationLoaded = null;
let championsCombinationLoaded = null;
let mlsCombinationLoaded = null

let libertadoresCache = null;
let championsCache = null;
let mlsCache = null

const loadInitialData = async () => {
    try {
        const [{ libertadoresTeams, championsTeams, mlsTeams }, dbCountries] = await Promise.all([
            getTeams(), getCountries()
        ]);

        libertadoresCachedTeams = [...libertadoresTeams];
        championsCachedTeams = [...championsTeams];
        mlsCachedTeams = [...mlsTeams]
        cachedCountries = [...dbCountries];

        console.log('Teams and countries data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

(async () => {
    await loadInitialData(); // Ensure data is loaded before proceeding
    const { libertadores, champions, mls } = await readFromFile();

    libertadoresCombinationLoaded = libertadores;
    championsCombinationLoaded = champions;
    mlsCombinationLoaded = mls
})();

const readFromFile = async () => {
    if (libertadoresCache && championsCache && mls) {
        return { libertadoresCache, championsCache, mls };
    }

    try {
        libertadoresCache = convertToMap(libertadoresCachedTeams);
        championsCache = convertToMap(championsCachedTeams);
        mlsCache = convertToMap(mlsCachedTeams)

        return { libertadores: libertadoresCache, champions: championsCache, mls: mlsCache };
    } catch (err) {
        console.error('Error reading or parsing file:', err);
        return { libertadoresCache: new Map(), championsCache: new Map(), mlsCache: new Map() }; // Return empty Maps on error
    }
}

const convertToMap = (teamsArray) => {
    return teamsArray.reduce((map, teamObj) => {
        map.set(teamObj.name, new Set(teamObj.countries));
        return map;
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
        const dataCache = setTournamentParam(tournament, 'cache')

        const teamData = dataCache.get(teamName)
        const possibleCountries = []

        for (const country of teamData.keys()) {
            const cachedCountry = cachedCountries.find(c => c.name === country)
            if (cachedCountry) possibleCountries.push(cachedCountry)
        }

        return possibleCountries
    },

    getFinalResult: (randomCountries, randomTeams, tournament) => {
        let playersNumber = 0;
        const noPossiblePlayersMatch = [];
        const teamCombinationLoaded = setTournamentParam(tournament, 'loaded')

        randomTeams.forEach(team => {
            const validCountries = teamCombinationLoaded.get(team.name); // Cache lookup once
            if (!validCountries) return; // Guard against missing team

            randomCountries.forEach(country => {
                if (!validCountries.has(country.name)) noPossiblePlayersMatch.push([country.name, team.name]);
                else playersNumber++;
            });
        });

        return { playersNumber, noPossiblePlayersMatch };
    },

    filterCountriesPerTeam: async (countries, team, tournament) => {
        const countriesSet = [...new Set(countries)];
        const TournamentTeam = setTournamentParam(tournament, 'team')

        try {
            await TournamentTeam.findOneAndUpdate(
                { name: team },
                { $set: { countries: countriesSet } },
                { new: true }
            );
            console.log(`New update on ${team}`);
        } catch (err) {
            console.log(err);
        }
    },

    getCachedTeams: (tournament) => {
        return setTournamentParam(tournament, 'cachedTeam')
    },

    writeLog: async (message, req, type) => {
        const [ua, ip] = [req.headers['user-agent'], req.headers['x-forwarded-for'] || req.connection.remoteAddress]

        try {
            console.log(`New request, IP: ${ip}, UA: ${ua}. -> ${message}`);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },

    setTournament: (tournament) => {
        return setTournamentParam(tournament, 'team')
    },

    getTournamentPlayers: (tournament) => {
        return setTournamentParam(tournament, 'player')
    }
};