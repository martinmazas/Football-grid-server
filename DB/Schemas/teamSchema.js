const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    name: { type: String },
    code: { type: String },
    url: { type: String }
});

const Team = model("teams", teamSchema)
module.exports = Team