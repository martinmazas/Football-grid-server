const { Schema, model } = require('mongoose')

const DataSchema = new Schema({
    team: String,
    countries: [String]
})

const Data = model("data", DataSchema)
module.exports = Data