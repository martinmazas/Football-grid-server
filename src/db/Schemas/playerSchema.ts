import { Schema, model, Document } from "mongoose";

export interface IPlayer extends Document {
  first_name: string;
  second_name: string;
  imgPath: string;
  country: string;
  team: string;
}

const playerSchema = new Schema<IPlayer>({
  first_name: { type: String },
  second_name: { type: String },
  imgPath: { type: String, required: true },
  country: { type: String, required: true },
  team: { type: String, required: true },
});

const Player = model<IPlayer>("player", playerSchema, "player");

export default Player;
