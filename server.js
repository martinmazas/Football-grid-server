const express = require('express')
const app = express()
const cors = require('cors')
process.loadEnvFile()
const PORT = process.env.PORT || 3001
const DB = require('./DB/DBconnection')
const { playerRoutes } = require('./Routes/playerRoutes')
const { paramsRoutes } = require('./Routes/paramsRoutes')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/players', playerRoutes)
app.use('/parameters', paramsRoutes)

app.get('/', (req, res) => {
    res.send('TicTacToe-server')
})


app.listen(PORT, async () => {
    let uri = process.env.MONGO_URI
    const db = new DB(uri)
    await db.connectToDB()
    console.log(`Server running on port ${PORT}`);
})
