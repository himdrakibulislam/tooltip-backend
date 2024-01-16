import mongoose,{ Schema } from "mongoose";

const subscriptionSchema = Schema({
    subscriber:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    channle:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },

},{timestamps:true});

export const Subscriptiuon = mongoose.model("Subscription",subscriptionSchema);
