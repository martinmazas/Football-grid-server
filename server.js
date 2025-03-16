const express = require('express');
const cors = require('cors');
require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');
const { teamRoutes } = require('./Routes/teamRoutes')
const { countryRoutes } = require('./Routes/countryRoutes');
const { logRoutes } = require('./Routes/logRoutes')

// Middleware to ensure the 'tournament' parameter is included in every request
const tournamentMiddleware = (req, res, next) => {
    const tournament = req.query.tournament || req.body.tournament || req.headers['tournament'];

    if (!tournament) {
        return res.status(400).json({ error: 'Tournament parameter is required' });
    }

    // Attach the tournament to the request object, so it's accessible in the routes
    req.tournament = tournament;
    next();
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    methods: ['GET', 'POST']
}))
const apiRouter = express.Router()

// Routes
apiRouter.use('/logs', logRoutes)
apiRouter.use(tournamentMiddleware)
apiRouter.use('/players', playerRoutes)
apiRouter.use('/parameters', paramsRoutes)
apiRouter.use('/teams', teamRoutes)
apiRouter.use('/countries', countryRoutes)

app.use('/api', apiRouter)
// Fallback route (for example, a 404 for undefined API routes)
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, '0.0.0.0', async () => {
    let uri = process.env.MONGO_URI
    const db = new DB(uri)
    await db.connectToDB()
    console.log(`Server running on port ${PORT}`)
})