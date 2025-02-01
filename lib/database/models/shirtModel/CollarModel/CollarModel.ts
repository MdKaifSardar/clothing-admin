import { Schema } from "mongoose";
import { CollarButtonSchema } from "./CollarButtonModel";
import { CollarHeightSchema } from "./CollarHeightModel";
import { CollarStyleSchema } from "./CollarStyle";

export const CollarSchema = new Schema({
  style: { 
    type: CollarStyleSchema, 
    required: true 
  },
  height: { 
    type: CollarHeightSchema, 
    required: true 
  },
  collar_button: { 
    type: CollarButtonSchema, 
    required: true 
  },
});

export default mongoose.model<Collar>("Collar", CollarSchema);
