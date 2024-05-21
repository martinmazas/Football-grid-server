const Player = require('../DB/Schemas/playerSchema')

const teams = []
const countries = []

const teamCombination = new Map()

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
    getFinalResult: async (randomCountries, randomTeams) => {
        let playersNumber = 0
        const noPossiblePlayers = []

        for (let i = 0; i < randomCountries.length; i++) {
            countries.push(randomCountries[i].name)

            for (let j = 0; j < randomTeams.length; j++) {
                await Player.findOne({
                    country: randomCountries[i].name,
                    team: randomTeams[j].name
                }).
                    then(data => {
                        if (!data) {
                            noPossiblePlayers.push([randomCountries[i].name, randomTeams[j].name])
                        }
                        else {
                            playersNumber++
                        }
                    })
                    .catch(err => console.log(err))
                if (i === 0) teams.push(randomTeams[j].name)
            }
        }

        return ({ playersNumber, noPossiblePlayers })
    },
    getTeams: () => {
        return teams
    },
    getCountries: () => {
        return countries
    },
    setValuesToZero: () => {
        while (teams.length && countries.length) {
            teams.pop()
            countries.pop()
        }
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

        // countriesCombinations.forEach((val, key) => {
        //     const teams = []
        //     if (val.size > 2) val.forEach((v, k) => teams.push(k))

        //     // try {
        //     //     if (teams.length) fs.appendFileSync('../teamsCombinations.csv', `${key}, ${teams.sort()}\n`)
        //     // } catch (err) {
        //     //     console.log(err)
        //     // }
        // })

        // try {
        //     const data = fs.readFileSync('../teamsCombinations.csv', 'utf8')
        //     data.map(line => console.log(line))
        // } catch(err) {
        //     console.log(err)
        // }
    },
    getTeamCombination: (team) => {
        return teamCombination.get(team)
    }
}