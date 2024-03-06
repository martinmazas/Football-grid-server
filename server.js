const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
    res.send('Test')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
