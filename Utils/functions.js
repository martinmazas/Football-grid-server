const fs = require('fs').promises
const path = require('path');
const { getTeams } = require('../Controllers/teamsController');
const { getCountries } = require('../Controllers/countryController');
const { getData, saveData } = require('../Controllers/dataController');

let cachedTeams = []
let cachedCountries = []

const teamCombination = new Map()
let teamCombinationLoaded = null
let dataCache = null

async function loadInitialData() {
    try {
        const [dbTeams, dbCountries] = await Promise.all([
            getTeams(), getCountries()
        ])
        cachedTeams.push(...dbTeams)
        cachedCountries.push(...dbCountries);

        console.log('Teams and countries data loaded successfully');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

function convertToMap(teamsArray) {
    const teamsMap = new Map();
    teamsArray.forEach(teamObj => {
        teamsMap.set(teamObj.team, new Set(teamObj.countries));
    });

    return teamsMap;
}

// Function to convert the map to a string
function mapToString(map) {
    const obj = {};
    for (const [key, value] of map) {
        if (value instanceof Map) {
            obj[key] = mapToString(value);
        } else {
            obj[key] = value
        }
    }
    return obj;
}

// Function to read from the file and return a Map
async function readFromFile() {
    if (dataCache) return dataCache // Return cached data if available

    try {
        const data = await getData()
        dataMap = convertToMap(data)

        dataCache = dataMap; // Cache the data
        return dataMap;
    } catch (err) {
        console.error('Error reading or parsing file:', err);
        return new Map(); // Return an empty Map on error
    }
}

// Load the teamCombinationLoaded when the module is initialized
(async () => {
    teamCombinationLoaded = await readFromFile();
    await loadInitialData()
})();

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
    filterCountriesPerTeam: (players) => {
        const countriesCombinations = new Map()

        players.forEach(player => {
            const team = player.team;
            const country = player.country;

            if (!teamCombination.has(team)) {
                teamCombination.set(team, new Map());
            }
            teamCombination.get(team).set(country, true);

            if (!countriesCombinations.has(country)) {
                countriesCombinations.set(country, new Map());
            }
            countriesCombinations.get(country).set(team, true);
        });

        // Convert the map to a JSON string
        const mapString = JSON.stringify(mapToString(teamCombination), null, 2);
        saveData(teamCombination)
        // Write the string to data.txt
        fs.writeFile('data.txt', mapString)
            .then(() => console.log('Map has been saved to data.txt'))
            .catch(err => console.error('Error writing to file:', err))
    },
    getTeamCombination: (team) => {
        return dataCache.get(team);
    },
    getCachedTeams: () => {
        return cachedTeams
    },
    getCachedCountries: () => {
        return cachedCountries
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
