import mongoose, { Schema, Document } from "mongoose";

// CollarStyle schema interface
export interface CollarStyle extends Document {
  name: string;
  image: {
    url: string;
    public_id: string;
  };
  icon: {
    url: string;
    public_id: string;
  };
  price: number;
}

// CollarStyle schema definition
export const CollarStyleSchema = new Schema<CollarStyle>({
  name: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  icon: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  price: { type: Number, required: true },
});

// CollarStyle model definition
const CollarStyleModel = mongoose.model<CollarStyle>("CollarStyle", CollarStyleSchema);

export default CollarStyleModel;
