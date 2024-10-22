const { getTeams } = require('../Controllers/teamsController');
const { getCountries } = require('../Controllers/countryController');
const { ChampionsLeagueTeam, CopaLibertadoresTeam } = require('../DB/Schemas/teamSchema');

// Constants for tournament types
const TOURNAMENTS = {
    CHAMPIONS_LEAGUE: 'CHAMPIONS LEAGUE',
    LIBERTADORES: 'COPA LIBERTADORES',
};

let cachedCountries = [];
let libertadoresCachedTeams = [];
let championsCachedTeams = [];

let libertadoresCombinationLoaded = null;
let championsCombinationLoaded = null;

let libertadoresCache = null;
let championsCache = null;

const loadInitialData = async () => {
    try {
        const [{ libertadoresTeams, championsTeams }, dbCountries] = await Promise.all([
            getTeams(), getCountries()
        ]);

        libertadoresCachedTeams = [...libertadoresTeams];
        championsCachedTeams = [...championsTeams];
        cachedCountries = [...dbCountries];

        console.log('Teams and countries data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

(async () => {
    await loadInitialData(); // Ensure data is loaded before proceeding
    const { libertadores, champions } = await readFromFile();

    libertadoresCombinationLoaded = libertadores;
    championsCombinationLoaded = champions;
})();

const readFromFile = async () => {
    if (libertadoresCache && championsCache) {
        return { libertadoresCache, championsCache };
    }

    try {
        libertadoresCache = convertToMap(libertadoresCachedTeams);
        championsCache = convertToMap(championsCachedTeams);

        return { libertadores: libertadoresCache, champions: championsCache };
    } catch (err) {
        console.error('Error reading or parsing file:', err);
        return { libertadoresCache: new Map(), championsCache: new Map() }; // Return empty Maps on error
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
        const dataCache = tournament === TOURNAMENTS.CHAMPIONS_LEAGUE ? championsCache : libertadoresCache;
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
        const teamCombinationLoaded = tournament === TOURNAMENTS.CHAMPIONS_LEAGUE
            ? championsCombinationLoaded
            : libertadoresCombinationLoaded;

        randomTeams.forEach(team => {
            const validCountries = teamCombinationLoaded.get(team.name); // Cache lookup once
            if (!validCountries) return; // Guard against missing team

            randomCountries.forEach(country => {
                if (!validCountries.has(country.name)) {
                    noPossiblePlayersMatch.push([country.name, team.name]);
                } else {
                    playersNumber++;
                }
            });
        });

        return { playersNumber, noPossiblePlayersMatch };
    },

    filterCountriesPerTeam: async (countries, team, tournament) => {
        const countriesSet = [...new Set(countries)];
        const TournamentTeam = tournament === TOURNAMENTS.CHAMPIONS_LEAGUE
            ? ChampionsLeagueTeam
            : CopaLibertadoresTeam;

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
        return tournament === TOURNAMENTS.CHAMPIONS_LEAGUE
            ? championsCachedTeams
            : libertadoresCachedTeams;
    },

    writeLog: async (message, req, type) => {
        const [ua, ip] = [req.headers['user-agent'], req.headers['x-forwarded-for'] || req.connection.remoteAddress]

        try {
            console.log(`New request, IP: ${ip}, UA: ${ua}. -> ${message}`);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },
};
