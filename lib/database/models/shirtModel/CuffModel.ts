import mongoose, { Schema, Document } from "mongoose";

export interface Cuff extends Document {
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
  cufflinks: {
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
  watch_compatible: {
    name: string;
    price: number;
  };
}

export const CuffSchema = new Schema<Cuff>({
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
  cufflinks: {
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
  watch_compatible: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
});

const CuffModel = mongoose.model<Cuff>("Cuff", CuffSchema);

export default CuffModel;
