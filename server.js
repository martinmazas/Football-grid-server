const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');
const { writeLog } = require('./Utils/functions');

// Load environment variables from .env file if it exists
config();

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());

        // Routes
        app.use('/players', playerRoutes);
        app.use('/parameters', paramsRoutes);

        // Root route
        app.get('/', (req, res) => {
            res.send('TicTacToe-server');
        });

        // Database connection and server start
        let uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const db = new DB(uri);
        await db.connectToDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(writeLog(`Error starting server: ${err.message}`, 'error'));
    }
}

// Start the server
startServer();
