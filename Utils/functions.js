const fs = require('fs').promises
const path = require('path');
const { getTeams } = require('../Controllers/teamsController');
const { getCountries } = require('../Controllers/countryController');
const Team = require('../DB/Schemas/teamSchema');

let cachedTeams = []
let cachedCountries = []
let teamCombinationLoaded = null
let dataCache = null

async function loadInitialData() {
    // When the server starts, get the teams and countries
    try {
        const [dbTeams, dbCountries] = await Promise.all([
            getTeams(), getCountries()
        ])

        cachedTeams.push(...dbTeams)
        cachedCountries.push(...dbCountries)

        console.log('Teams and countries data loaded successfully')
    } catch (error) {
        console.error('Error loading initial data:', error)
    }
}

// Loads the require data when the server is started
(async () => {
    await loadInitialData()
    teamCombinationLoaded = await readFromFile()
})();

// Function to read from the file and return a Map
async function readFromFile() {
    if (dataCache) return dataCache // Return cached data if available

    try {
        dataCache = convertToMap(cachedTeams) // Cache the data
        return dataCache;
    } catch (err) {
        console.error('Error reading or parsing file:', err)
        return new Map(); // Return an empty Map on error
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
    getPossibleCountries: (teamName) => {
        return [...dataCache.get(teamName).keys()]
            .map(country => cachedCountries.find(c => c.name === country))
            .filter(Boolean);  // Filter out undefined values
    },
    getFinalResult: (randomCountries, randomTeams) => {
        let playersNumber = 0
        const noPossiblePlayersMatch = []

        randomCountries.map(country => {
            randomTeams.map(team => {
                if (!teamCombinationLoaded.get(team.name).has(country.name)) {
                    noPossiblePlayersMatch.push([country.name, team.name])
                } else playersNumber++
            })
        })
        return { playersNumber, noPossiblePlayersMatch };
    },
    filterCountriesPerTeam: (countries, team) => {
        // Receives country and team and will save it into teams schema
        const countriesSet = [...new Set(countries)]

        Team.findOneAndUpdate({ name: team },
            { $set: { countries: countriesSet } },
            { new: true })
            .then(() => { console.log(`New update on ${team}`) })
            .catch(err => console.log(err))

        console.log('Countries array was updated in DB')
    },
    getCachedTeams: () => {
        return cachedTeams
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
