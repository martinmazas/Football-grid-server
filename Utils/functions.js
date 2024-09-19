const fs = require('fs').promises
const path = require('path');
const { getTeams } = require('../Controllers/teamsController');
const { getCountries } = require('../Controllers/countryController');
const { ChampionsLeagueTeam, CopaLibertadoresTeam } = require('../DB/Schemas/teamSchema')

let cachedCountries = []
// let cachedTeams = []
let libertadoresCachedTeams = []
let championsCachedTeams = []

// let teamCombinationLoaded = null
let libertadoresCombinationLoaded = null
let championsCombinationLoaded = null

// let dataCache = null
let libertadoresCache = null
let championsCache = null

async function loadInitialData() {
    // When the server starts, get the teams and countries
    try {
        const [{ libertadoresTeams, championsTeams }, dbCountries] = await Promise.all([
            getTeams(), getCountries()
        ])

        // cachedTeams.push(...dbTeams)
        libertadoresCachedTeams.push(...libertadoresTeams)
        championsCachedTeams.push(...championsTeams)
        cachedCountries.push(...dbCountries)

        console.log('Teams and countries data loaded successfully')
    } catch (error) {
        console.error('Error loading initial data:', error)
    }
}

// Loads the required data when the server is started
(async () => {
    await loadInitialData();  // Ensure data is loaded before proceeding

    // Populate the combinations after loading the initial data
    const { libertadores, champions } = await readFromFile()

    libertadoresCombinationLoaded = libertadores
    championsCombinationLoaded = champions
})();

// Function to read from the file and return a Map
async function readFromFile() {
    if (libertadoresCache && championsCache) {
        return { libertadoresCache, championsCache }; // Return cached data if available
    }

    try {
        libertadoresCache = convertToMap(libertadoresCachedTeams);  // Create a map from cached teams
        championsCache = convertToMap(championsCachedTeams);  // Create a map from cached teams

        const libertadores = libertadoresCache
        const champions = championsCache
        return { libertadores, champions };
    } catch (err) {
        console.error('Error reading or parsing file:', err);
        return { libertadoresCache: new Map(), championsCache: new Map() }; // Return empty Maps on error
    }
}

function convertToMap(teamsArray) {
    const teamsMap = new Map()
    teamsArray.forEach(teamObj => {
        teamsMap.set(teamObj.name, new Set(teamObj.countries))
    });

    return teamsMap;
}

module.exports = {
    getRandomNumbers: (requiredElements, elements) => {
        const result = new Map()
        const len = elements.length // total countries or teams
        // Picks x random numbers in order to get random teams or countries
        while (result.size < requiredElements - 1) {
            const rand = Math.floor(Math.random() * len)
            result.set(elements[rand].name, elements[rand])
        }

        return Array.from(result.values());
    },
    // Helper function to get possible countries for a team
    getPossibleCountries: (teamName, tournament) => {
        const dataCache = tournament === 'CHAMPIONS LEAGUE' ? championsCache : libertadoresCache
        return [...dataCache.get(teamName).keys()]
            .map(country => cachedCountries.find(c => c.name === country))
            .filter(Boolean);  // Filter out undefined values
    },
    getFinalResult: (randomCountries, randomTeams, tournament) => {
        let playersNumber = 0
        const noPossiblePlayersMatch = []
        let teamCombinationLoaded = tournament === 'CHAMPIONS LEAGUE' ? championsCombinationLoaded : libertadoresCombinationLoaded

        randomCountries.map(country => {
            randomTeams.map(team => {
                if (!teamCombinationLoaded.get(team.name).has(country.name)) {
                    noPossiblePlayersMatch.push([country.name, team.name])
                } else playersNumber++
            })
        })
        return { playersNumber, noPossiblePlayersMatch };
    },
    filterCountriesPerTeam: (countries, team, tournament) => {
        // Receives country and team and will save it into teams schema
        const countriesSet = [...new Set(countries)]
        const TournamentTeam = tournament === 'CHAMPIONS LEAGUE' ? ChampionsLeagueTeam : CopaLibertadoresTeam

        TournamentTeam.findOneAndUpdate({ name: team },
            { $set: { countries: countriesSet } },
            { new: true })
            .then(() => { console.log(`New update on ${team}`) })
            .catch(err => console.log(err))

        console.log('Countries array was updated in DB')
    },
    getCachedTeams: (tournament) => {
        return tournament === 'CHAMPIONS LEAGUE' ? championsCachedTeams : libertadoresCachedTeams
    },
    writeLog: (message, type) => {
        const logDir = path.join(__dirname, '../Logs');
        const logFile = path.join(logDir, 'logs.log');

        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${type.toUpperCase()} - ${message}\n`

        fs.appendFile(logFile, logEntry)
            .then(() => console.log(message))
            .catch(err => console.error('Failed to write to log file:', err))
    },
    getReqHeaders: (req) => {
        return [req.headers['user-agent'], req.headers['referer']]
    }
};
