const express = require('express');
const cors = require('cors');
require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');


const app = express();
const PORT = process.env.PORT || 3001;


const corsOptions = {
    origin: ['https://football-grid.netlify.app/', 'http://localhost:3000'], // Replace with your domain
    optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))

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
