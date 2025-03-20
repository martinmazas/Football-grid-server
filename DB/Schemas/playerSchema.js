const { Schema, model } = require("mongoose");

const playerSchema = new Schema({
    first_name: { type: String },
    second_name: { type: String },
    imgPath: { type: String },
    country: { type: String },
    team: { type: String }
});

const Player = model('player', playerSchema, 'player')

module.exports = {
    Player
}