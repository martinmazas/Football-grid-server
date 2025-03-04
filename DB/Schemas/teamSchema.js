const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: { type: String },
    code: { type: String },
    url: { type: String },
    countries: {type: [String]}
});

const ChampionsLeagueTeam = model("ChampionsLeague", teamSchema, "champions_league_team")
const CopaLibertadoresTeam = model("CopaLibertadores", teamSchema, "copa_libertadores_team")
const MLSTeam = model('MLS', teamSchema, "mls_team")
const EuropeLeagueTeam = model('EuropeLeague', teamSchema, "europe_league_team")

module.exports = {
    ChampionsLeagueTeam,
    CopaLibertadoresTeam,
    MLSTeam,
    EuropeLeagueTeam
}