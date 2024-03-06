const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.get('/', (req, res) => {
    res.send('Nodemon')
})

app.get('/players', (req, res) => {
    res.send()
})

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
})
