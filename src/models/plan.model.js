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
        type: Array,
    },

},{timestamps:true});

export const Plan = mongoose.model("Plan",planSchema);
