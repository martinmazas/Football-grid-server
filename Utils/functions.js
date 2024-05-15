const Player = require('../DB/Schemas/playerSchema')

const teams = []
const countries = []

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
                            console.log(`No player for ${randomCountries[i].name}-${randomTeams[j].name}`)
                        }
                        else {
                            playersNumber++
                            console.log(`At least one player for ${randomCountries[i].name}-${randomTeams[j].name}`)
                        }
                    })
                    .catch(err => console.log(err))
                if (i === 0) teams.push(randomTeams[j].name)
            }
        }
        console.log(playersNumber)
        console.log(noPossiblePlayers)
        return({ playersNumber, noPossiblePlayers })
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
    }
}