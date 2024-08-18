const { Schema, model } = require("mongoose");

const playerSchema = new Schema({
    first_name: { type: String },
    second_name: { type: String },
    imgPath: { type: String },
    country: { type: String },
    team: { type: String }
});

const Player = model("players/2024-2025", playerSchema);
// const Player = model("players", playerSchema);
module.exports = Player