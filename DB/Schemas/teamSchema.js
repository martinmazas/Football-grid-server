const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: { type: String },
    code: { type: String },
    url: { type: String },
    countries: {type: [String]}
});

const Team = model("team", teamSchema)
module.exports = Team