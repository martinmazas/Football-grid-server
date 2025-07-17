import { Schema, model, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  code: string;
  url: string;
  countries: string[];
  tournaments: string[];
}

const teamSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  url: { type: String, required: true },
  countries: { type: [String], required: true },
  tournaments: { type: [String], required: true },
});

const Team = model<ITeam>("team", teamSchema, "team");

export default Team;
