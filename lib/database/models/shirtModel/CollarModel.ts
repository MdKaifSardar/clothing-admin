import mongoose, { Schema, Document } from "mongoose";

export interface Collar extends Document {
  style: {
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
  };
  height: {
    name: string;
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  collar_button: {
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
  };
}

export const CollarSchema = new Schema<Collar>({
  style: {
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
  },
  height: {
    name: { type: String, required: true },
    icon: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    price: { type: Number, required: true },
  },
  collar_button: {
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
  },
});

export default mongoose.model<Collar>("Collar", CollarSchema);
