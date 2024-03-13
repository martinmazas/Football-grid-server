const {Schema, model} = require("mongoose");

const playerSchema = new Schema({
    id: {type: String, required: true},
    firstName: {type: String},
    secondName: {type: String},
    imgPath: {type: String},
    country: {type: String},
    team: {type: String}
});

const PlayerProgram = model("playerProgram", playerSchema);
module.exports = PlayerProgram;