import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { readdir } from 'node:fs/promises';

const createSubscription = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  //   const subscription = await Subscription.create({
  //     userId : req.user._id,
  //     planId : "65c35ac3a2a7944d263dea0e",
  //     startDate : new Date().getTime(),
  //     endDate : new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
  //   });
 
  

  return res.json(new ApiResponse(200, {subscription_message : "Your Subscription is still active" }, "Paid"));
});

export { createSubscription };
