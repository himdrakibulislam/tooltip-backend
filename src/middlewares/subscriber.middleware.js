import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const subscriber = asyncHandler(async (req, res, next) => {
    try {
      const user = req.user;
      const subscription = await Subscription.findOne({ userId: user._id});
      if (!subscription) {
        throw new ApiError(401, "Subscription not found!.");
      }
      
      const isActive = subscription.endDate ? subscription.endDate > Date.now() : false;
      if(!isActive){
        throw new ApiError(401, "Subscription ended!.");
      }
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid Request!.");
    }
  });