// Shirt.js
import { Schema, model } from "mongoose";
import { PocketSchema } from "./PocketModel";
import { FitSchema } from "./FitModel";
import { CollarSchema } from "./CollarModel";
import { CuffSchema } from "./CuffModel";
import { PlacketSchema } from "./PlacketModel";
import { BottomSchema } from "./BottomModel";
import { BackSchema } from "./BackModel";
import { SleevesSchema } from "./SleeveModel";
import { MonogramSchema } from "./MonogramModel";
import MeasurementsSchema from "./MeasurementsModel";
import { FabricSchema } from "./FabricModel"; // Import the Fabric schema
import { ColorSchema } from "./ColorModel";   // Import the Color schema

export const ShirtSchema = new Schema(
  {
    fit: {
      type: FitSchema,
      required: true,
    },
    pocket: {
      type: PocketSchema,
      required: true,
    },
    placket: {
      type: PlacketSchema,
      required: true,
    },
    bottom: {
      type: BottomSchema,
      required: true,
    },
    back: {
      type: BackSchema,
      required: true,
    },
    sleeves: {
      type: SleevesSchema,
      required: true,
    },
    monogram: {
      type: MonogramSchema,
      required: false, // Optional field
    },
    collar: {
      type: CollarSchema,
      required: true,
    },
    cuff: {
      type: CuffSchema,
      required: true,
    },
    measurements: {
      type: MeasurementsSchema,
      required: false,
    },
    fabric: {
      type: FabricSchema,
      required: true, // Assuming fabric is a required field
    },
    color: {
      type: ColorSchema,
      required: true, // Assuming color is a required field
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default model("Shirt", ShirtSchema);
