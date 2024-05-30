const express = require('express');
const cors = require('cors');
require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');
const { writeLog } = require('./Utils/functions');

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());

        // Routes
        app.use('/players', playerRoutes)
        app.use('/parameters', paramsRoutes)

        // Root route
        app.get('/', (req, res) => {
            res.send('TicTacToe-server')
        });

        // Database connection and server start
        let uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const db = new DB(uri);
        await db.connectToDB();

        // Set timeout for server restart
        const TIMEOUT = 5000; // 5 seconds

        const restartServer = () => {
            console.log('Operation timeout reached. Restarting server...');
            process.exit(1); // Exit with failure code to restart if using a process manager
        };

        // Timeout for the getParams route
        app.use('/parameters', (req, res, next) => {
            setTimeout(restartServer, TIMEOUT);
            next();
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error(writeLog(`Error starting server: ${err.message}`, 'error'))
    }
}

// Start the server
startServer()
