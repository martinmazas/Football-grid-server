const { Schema, model } = require("mongoose");

const playerSchema = new Schema({
    first_name: { type: String },
    second_name: { type: String },
    imgPath: { type: String },
    country: { type: String },
    team: { type: String }
});

const ChampionsLeaguePlayer = model("championsLeague", playerSchema, 'champions_league_players');
const CopaLibertadoresPlayer = model("copaLibertadores", playerSchema, 'copa_libertadores_players');

module.exports = {
    ChampionsLeaguePlayer,
    CopaLibertadoresPlayer
}