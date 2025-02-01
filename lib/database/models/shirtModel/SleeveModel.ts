import mongoose, { Schema, Document } from "mongoose";

export interface Sleeves extends Document {
    name: string;
    image: {
        url: string;
        public_id: string;
    };
    price: number;
    icon: {
        url: string;
        public_id: string;
    };
}

export const SleevesSchema = new Schema<Sleeves>({
    name: { type: String, required: true },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    price: { type: Number, required: true },
    icon: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
});

const SleevesModel = mongoose.model<Sleeves>("Sleeves", SleevesSchema);

export default SleevesModel;
