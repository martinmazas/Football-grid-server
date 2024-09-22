const fs = require('fs').promises
const path = require('path');
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

async function loadInitialData() {
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

async function readFromFile() {
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

function convertToMap(teamsArray) {
    return teamsArray.reduce((map, teamObj) => {
        map.set(teamObj.name, new Set(teamObj.countries));
        return map;
    }, new Map());
}

module.exports = {
    getRandomNumbers: (requiredElements, elements) => {
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
        return [...dataCache.get(teamName).keys()]
            .map(country => cachedCountries.find(c => c.name === country))
            .filter(Boolean);
    },

    getFinalResult: (randomCountries, randomTeams, tournament) => {
        let playersNumber = 0;
        const noPossiblePlayersMatch = [];
        const teamCombinationLoaded = tournament === TOURNAMENTS.CHAMPIONS_LEAGUE
            ? championsCombinationLoaded
            : libertadoresCombinationLoaded;

        randomCountries.forEach(country => {
            randomTeams.forEach(team => {
                if (!teamCombinationLoaded.get(team.name).has(country.name)) {
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

    writeLog: async (message, type) => {
        const logDir = path.join(__dirname, '../Logs');
        const logFile = path.join(logDir, 'logs.log');
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${type.toUpperCase()} - ${message}\n`;

        try {
            await fs.appendFile(logFile, logEntry);
            console.log(message);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    },

    getReqHeaders: (req) => {
        return [req.headers['user-agent'], req.headers['referer']];
    }
};
