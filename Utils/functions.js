const fs = require('fs')
const path = require('path')

let teams = []
let countries = []

const teamCombination = new Map()
let teamCombinationLoaded = readFromFile()

function readFromFile() {
    function objectToMap(obj) {
        const map = new Map();
        for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                map.set(key, objectToMap(value));
            } else {
                map.set(key, value);
            }
        }
        return map;
    }

    // Read the JSON file synchronously
    try {
        const data = fs.readFileSync('data.txt', 'utf8');
        const dataObject = JSON.parse(data);

        // Convert the parsed object to a Map
        const dataMap = objectToMap(dataObject);
        return dataMap
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

module.exports = {
    getRandomNumbers: (requiredElements, elements) => {
        const result = new Set()

        // Picks x random numbers in order to get random teams and countries
        while (result.size < requiredElements - 1) {
            const rand = Math.floor(Math.random() * (elements.length))
            result.add(elements[rand])
        }

        return Array.from(result)
    },
    getFinalResult: (randomCountries, randomTeams) => {
        let playersNumber = 0
        const noPossiblePlayersMatch = []

        for (let i = 0; i < randomCountries.length; i++) {
            countries.push(randomCountries[i].name)

            for (let j = 0; j < randomTeams.length; j++) {
                if (i === 0) teams.push(randomTeams[j].name)

                if (!teamCombinationLoaded.get(randomTeams[j].name).get(randomCountries[i].name)) {
                    noPossiblePlayersMatch.push([randomCountries[i].name, randomTeams[j].name])
                } else playersNumber++
            }
        }

        return ({ playersNumber, noPossiblePlayersMatch })
    },
    getTeams: () => {
        return teams
    },
    getCountries: () => {
        return countries
    },
    setValuesToZero: () => {
        teams = []
        countries = []
    },
    filterCountriesPerTeam: (players) => {
        const countriesCombinations = new Map()

        players.map(player => {
            const team = player.team
            const country = player.country

            if (!teamCombination.has(team)) {
                teamCombination.set(team, new Map())
            }
            teamCombination.get(team).set(country, true)

            if (!countriesCombinations.has(country)) {
                countriesCombinations.set(country, new Map())
            }
            countriesCombinations.get(country).set(team, true)
        })

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

        // Convert the map to a JSON string
        const mapString = JSON.stringify(mapToString(teamCombination), null, 2);

        // Write the string to data.txt
        fs.writeFileSync('data.txt', mapString);

        console.log('Map has been saved to data.txt');
    },
    getTeamCombination: (team) => {
        return teamCombinationLoaded.get(team)
    },
    writeLog: (message, type) => {
        const logDir = path.join(__dirname, '../Logs');
        const logFile = path.join(logDir, `logs.log`);

        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${type.toUpperCase()} - ${message}\n`

        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        })
    },
}