import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  paymentMethodId: {
    type: String,
  },
  paymentDetails: {
    type: Object,
  }, 
});
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
