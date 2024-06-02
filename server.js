const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser')
// const timeout = require('connect-timeout')
require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
// app.use(timeout('5s'))
// app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// function haltOnTimedout(req, res, next) {
//     console.log(req.timedout)
//     if (!req.timedout) next()
// }

// Routes
app.use('/players', playerRoutes)
app.use('/parameters', paramsRoutes)

app.get('/', (req, res) => {
    res.send('TicTacToe-server')
})

app.listen(PORT, async () => {
    let uri = process.env.MONGO_URI;
    const db = new DB(uri)
    await db.connectToDB()
    console.log(`Server running on port ${PORT}`)
})