const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: { type: String },
    code: { type: String },
    url: { type: String },
    countries: {type: [String]}
});

const Team = model("team", teamSchema)
const CopaLibertadoresTeam = model("CopaLibertadores", teamSchema, "copa_libertadores_team")
module.exports = {
    Team,
    CopaLibertadoresTeam
}