const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: { type: String },
    code: { type: String },
    url: { type: String },
    countries: {type: [String]},
    tournaments: {type: [String]}
});

const Team = model("Team", teamSchema, "team")

module.exports = {
    Team
}