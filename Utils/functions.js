const fs = require('fs').promises;
const path = require('path');

let teams = [];
let countries = [];

const teamCombination = new Map();
let teamCombinationLoaded = null;
let dataCache = null;

// Function to convert a plain object to a Map
function objectToMap(obj) {
    const map = new Map();
    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            map.set(key, objectToMap(value))
        } else {
            map.set(key, value)
        }
    }
    return map;
}

// Function to convert the map to a string
function mapToString(map) {
    const obj = {};
    for (const [key, value] of map) {
        if (value instanceof Map) {
            obj[key] = mapToString(value);
        } else {
            obj[key] = value;
        }
    }
    return obj;
}

// Function to read from the file and return a Map
async function readFromFile() {
    if (dataCache) return dataCache // Return cached data if available

    try {
        const data = await fs.readFile('data.txt', 'utf8');
        const dataObject = JSON.parse(data);
        const dataMap = objectToMap(dataObject);

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
})();

module.exports = {
    getRandomNumbers: (requiredElements, elements) => {
        const result = new Map()
        const len = elements.length // total countries or teams
        // Picks x random numbers in order to get random teams or countries
        while (result.size < requiredElements - 1) {
            const rand = Math.floor(Math.random() * len)
            result.set(elements[rand].name, elements[rand])
            // result.add(elements[rand])
        }

        return Array.from(result.values());
    },
    getFinalResult: (randomCountries, randomTeams) => {
        let playersNumber = 0
        const noPossiblePlayersMatch = []

        for (let i = 0; i < randomCountries.length; i++) {
            countries.push(randomCountries[i].name);

            for (let j = 0; j < randomTeams.length; j++) {
                if (i === 0) teams.push(randomTeams[j].name)

                if (!teamCombinationLoaded.get(randomTeams[j].name)?.get(randomCountries[i].name)) {
                    noPossiblePlayersMatch.push([randomCountries[i].name, randomTeams[j].name])
                } else {
                    playersNumber++;
                }
            }
        }

        return { playersNumber, noPossiblePlayersMatch };
    },
    setValuesToZero: () => {
        teams = [];
        countries = [];
    },
    filterCountriesPerTeam: (players) => {
        const countriesCombinations = new Map();

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

        // Write the string to data.txt
        fs.writeFile('data.txt', mapString)
            .then(() => console.log('Map has been saved to data.txt'))
            .catch(err => console.error('Error writing to file:', err))
    },
    getTeamCombination: (team) => {
        return dataCache.get(team);
    },
    writeLog: (message, type) => {
        const logDir = path.join(__dirname, '../Logs');
        const logFile = path.join(logDir, 'logs.log');

        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${type.toUpperCase()} - ${message}\n`

        fs.appendFile(logFile, logEntry)
            .then(() => console.log('Log entry added'))
            .catch(err => console.error('Failed to write to log file:', err))
    },
    getReqHeaders: (req) => {
        return [req.headers['user-agent'], req.headers['referer']]
    }
};
