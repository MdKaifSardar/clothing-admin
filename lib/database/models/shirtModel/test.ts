import mongoose, { Schema, Document } from "mongoose";


// Also to parse this we need a global map
// which can be a constant document

// Drop-down Option 
// can be combined to form a UID
// UID : [OptionName]+[OptionID]
interface DD_Option {
    name: string;
    id: number;
}

interface MonogramScript {
    text: string;
    design: string; // DESIGN IMAGE URL (ifany)
}
interface Monogram {
    enabled: boolean;
    style: DD_Option;
    position: DD_Option;
    color: DD_Option;
    block: string; // block type -> direct, patch etc
    script: MonogramScript;
}

interface Collar {
    style: DD_Option;
    height: DD_Option;
    collar_button: DD_Option;
}

interface Cuff {
    style: DD_Option;
    cufflinks: DD_Option;
    watch_compatible: DD_Option;
}
interface Measurements {
    unit: string; // CM OR INCH

    neck: number;
    chest: number;
    waist: number;
    hips: number;
    shoulder: number;
    sleeve_length: number;
    elbow_width: number;
    forearm_width: number;
    wrist_cuff: number;
    bicep: number;
    shirt_length: number;
    armhole: number;
}
interface OrderInfo {
    customer_id: mongoose.Types.ObjectId;
    shipping_address: string;
    phone: string;
    email: string;
}
interface Pricing {
    base_price: number;
    extra_costs: { feature: string; cost: number }[];
    total_price: number;
}
interface Payment {
    method: string;
    transaction_id: string;
}

interface Shirt extends Document {
    name: string;

    cloth: DD_Option;
    fit: DD_Option;
    pocket: DD_Option;
    placket: DD_Option;
    bottom: DD_Option;
    back: DD_Option;
    sleeves: DD_Option;
    color: DD_Option;

    monogram: Monogram;
    collar: Collar;
    cuff: Cuff;

    measurements: Measurements;
    order_info: OrderInfo;
    pricing: Pricing;
    payment: Payment;
}

const DDOptionSchema = new Schema<DD_Option>({
    name: { type: String, required: true },
    id: { type: Number, required: true }
});
const MonogramScriptSchema = new Schema<MonogramScript>({
    text: { type: String },
    design: { type: String }

});

const MonogramSchema = new Schema<Monogram>({
    enabled: { type: Boolean, required: true },
    style: DDOptionSchema,
    position: DDOptionSchema,
    color: DDOptionSchema,
    block: { type: String },
    script: MonogramScriptSchema,
});

const CollarSchema = new Schema<Collar>({
    style: DDOptionSchema,
    height: DDOptionSchema,
    collar_button: DDOptionSchema
});

const CuffSchema = new Schema<Cuff>({
    style: DDOptionSchema,
    cufflinks: DDOptionSchema,
    watch_compatible: DDOptionSchema
});

const MeasurementsSchema = new Schema<Measurements>({
    unit: { type: String, required: true },
    neck: { type: Number, required: true },
    chest: { type: Number, required: true },
    waist: { type: Number, required: true },
    hips: { type: Number, required: true },
    shoulder: { type: Number, required: true },
    sleeve_length: { type: Number, required: true },
    elbow_width: { type: Number, required: true },
    forearm_width: { type: Number, required: true },
    wrist_cuff: { type: Number, required: true },
    bicep: { type: Number, required: true },
    shirt_length: { type: Number, required: true },
    armhole: { type: Number, required: true },
});

const OrderInfoSchema = new Schema<OrderInfo>({
    customer_id: { type: Schema.Types.ObjectId, required: true },
    shipping_address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
});

const PricingSchema = new Schema<Pricing>({
    base_price: { type: Number, required: true },
    extra_costs: [{ feature: String, cost: Number }],
    total_price: { type: Number, required: true },
});

const PaymentSchema = new Schema<Payment>({
    method: { type: String, required: true },
    transaction_id: { type: String, required: true },
});

const ShirtSchema = new Schema<Shirt>({
    cloth: DDOptionSchema,
    fit: DDOptionSchema,
    pocket: DDOptionSchema,
    placket: DDOptionSchema,
    bottom: DDOptionSchema,
    back: DDOptionSchema,
    sleeves: DDOptionSchema,
    color: DDOptionSchema,

    monogram: MonogramSchema,
    collar: CollarSchema,
    cuff: CuffSchema,

    measurements: MeasurementsSchema,
    order_info: OrderInfoSchema,
    pricing: PricingSchema,
    payment: PaymentSchema,
});

const ShirtModel = mongoose.model<Shirt>("Shirt", ShirtSchema);

export default ShirtModel;