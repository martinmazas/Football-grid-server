const express = require('express');
const cors = require('cors');
require('dotenv').config()
const DB = require('./DB/DBconnection');
const { playerRoutes } = require('./Routes/playerRoutes');
const { paramsRoutes } = require('./Routes/paramsRoutes');
const { teamRoutes } = require('./Routes/teamRoutes')
const { countryRoutes } = require('./Routes/countryRoutes')


const app = express();
const PORT = process.env.PORT || 3001;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors())
const apiRouter = express.Router();


// Routes
apiRouter.use('/players', playerRoutes)
apiRouter.use('/parameters', paramsRoutes)
apiRouter.use('/teams', teamRoutes)
apiRouter.use('/countries', countryRoutes)

app.use('/api', apiRouter)

app.get('/', (req, res) => {
    res.send('FootballGrid-server')
})

app.listen(PORT, async () => {
    let uri = process.env.MONGO_URI
    const db = new DB(uri)
    await db.connectToDB()
    console.log(`Server running on port ${PORT}`)
})
