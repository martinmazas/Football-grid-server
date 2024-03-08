const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = process.env.PORT || 3001
const { playerRoutes } = require('./Routes/playerRoutes')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

// app.use('/api', apiRouter)

app.use('/players', playerRoutes)

app.get('/', (req, res) => {
    res.send('TicTacToe-server')
})


app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
})
