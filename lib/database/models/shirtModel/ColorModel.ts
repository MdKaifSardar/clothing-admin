import mongoose, { Schema, Document } from "mongoose";
// import { ShirtSchema } from "./ShirtModel";

export interface Color extends Document {
  name: string;
  hexCode: string;
//   shirt: typeof ShirtSchema;
}

export const ColorSchema = new Schema<Color>({
  name: { type: String, required: true },
  hexCode: { type: String, required: true },
//   shirt: { type: ShirtSchema, required: true }
});

const ColorModel = mongoose.model<Color>("Color", ColorSchema);

export default ColorModel;
