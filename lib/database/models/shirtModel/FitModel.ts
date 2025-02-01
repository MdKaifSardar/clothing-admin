import mongoose, { Schema, Document } from "mongoose";

export interface Fit extends Document {
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

export const FitSchema = new Schema<Fit>({
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

const FitModel = mongoose.model<Fit>("Fit", FitSchema);

export default FitModel;
