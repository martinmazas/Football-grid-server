const { Schema, model } = require("mongoose");

const playerSchema = new Schema({
    firstName: { type: String },
    secondName: { type: String },
    imgPath: { type: String },
    country: { type: String },
    team: { type: String }
});

const PlayerProgram = model("players", playerSchema);
module.exports = PlayerProgram;