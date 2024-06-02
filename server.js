const express = require('express');
const cors = require('cors');
const cluster = require('cluster')
const os = require('os')

require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');
const numCPUs = os.cpus().length;

if (cluster.isMater) {
    console.log(`Master process ${process.pid} is running`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker process ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    })
} else {
    console.log('in else')
    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors())

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
}