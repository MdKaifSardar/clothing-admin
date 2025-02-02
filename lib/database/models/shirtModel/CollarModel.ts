import mongoose, { Schema, Document } from "mongoose";

export interface Collar extends Document {
  style?: {
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
  height?: {
    name: string;
    icon: {
      url: string;
      public_id: string;
    };
    price: number;
  };
  collar_button?: {
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
    type: {
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
    required: false,
    default: undefined,
  },
  height: {
    type: {
      name: { type: String, required: true },
      icon: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
      price: { type: Number, required: true },
    },
    required: false,
    default: undefined,
  },
  collar_button: {
    type: {
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
    required: false,
    default: undefined,
  },
});

const CollarModel =
  mongoose.models.Collar || mongoose.model<Collar>("Collar", CollarSchema);

export default CollarModel;
