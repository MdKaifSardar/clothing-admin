import mongoose, { Schema, Document } from "mongoose";

// CollarButton schema interface
export interface CollarButton extends Document {
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

// CollarButton schema definition
export const CollarButtonSchema = new Schema<CollarButton>({
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

// CollarButton model definition
const CollarButtonModel = mongoose.model<CollarButton>("CollarButton", CollarButtonSchema);

export default CollarButtonModel;
