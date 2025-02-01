import mongoose, { Schema, Document } from "mongoose";

// Collar Height schema interface
export interface CollarHeight extends Document {
  name: string;
  icon: {
    url: string;
    public_id: string;
  };
  price: number;
}

// Collar Height schema definition
export const CollarHeightSchema = new Schema<CollarHeight>({
  name: { type: String, required: true },
  icon: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  price: { type: Number, required: true },
});

// Collar Height model definition
const CollarHeightModel = mongoose.model<CollarHeight>("CollarHeight", CollarHeightSchema);

export default CollarHeightModel;
