import mongoose, { Schema, Document } from "mongoose";
// import { Color, ColorSchema } from "./ColorModel";

export interface Fabric extends Document {
  fabricName: string;
  image: {
    url: string;
    public_id: string;
  };
  // color: Color;
}

export const FabricSchema = new Schema<Fabric>({
  fabricName: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  // color: { type: ColorSchema, required: true },
});

const FabricModel = mongoose.model<Fabric>("Fabric", FabricSchema);

export default FabricModel;
