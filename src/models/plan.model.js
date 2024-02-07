import mongoose,{ Schema } from "mongoose";

const planSchema = new Schema({
    title:{
        type: String,
        required : true,
    },
    price:{
        type: Number,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },

},{timestamps:true});

export const Plan = mongoose.model("Plan",planSchema);
