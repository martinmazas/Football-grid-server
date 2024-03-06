const { Router } = require('express')
const apiRouter = new Router()

apiRouter.use('/players', getPlayers)