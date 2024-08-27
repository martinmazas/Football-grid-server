const { Schema, model } = require('mongoose')

const CountrySchema = new Schema({
    name: {type: String},
    code: {type: String}
})

const Country = model("countries", CountrySchema)
module.exports = Country