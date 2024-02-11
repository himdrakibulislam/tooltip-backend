import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Content = mongoose.model("Content", contentSchema);
