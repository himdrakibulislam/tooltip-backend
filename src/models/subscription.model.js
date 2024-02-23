import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
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
  },
  { timestamps: true }
);
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
