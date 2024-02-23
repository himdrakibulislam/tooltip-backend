import mongoose, { Schema } from "mongoose";

const trashSchema = new Schema(
  {
    trashType: {
      type: String,
    },
    data: {
      type: Object,
    },
  },
  { timestamps: true }
);
export const Trash = mongoose.model("Trash", trashSchema);
