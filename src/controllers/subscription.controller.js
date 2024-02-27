import { Plan } from "../models/plan.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Trash } from "../models/trash.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import stripe from "../utils/stripe.js";
import { UTCTimestampToLocal } from "../utils/utils.js";
const createSubscription = asyncHandler(async (req, res) => {
  //   const subscription = await Subscription.create({
  //     userId : req.user._id,
  //     planId : "65c35ac3a2a7944d263dea0e",
  //     startDate : new Date().getTime(),
  //     endDate : new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
  //   });
  const { payment_method, planId, cus_name, cus_email } = req.body;

  if (
    [payment_method, planId, cus_name, cus_email].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, "Plan not found!");
    }
    const customer = await stripe.customers.create({
      name: cus_name,
      email: cus_email,
      payment_method: payment_method,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: "price_1OmqPcFmKu5Rjsf6C0oEA5eh",
        },
      ],
    });

    // moving user previous subscriptions to trash table
    const trashData = [];
    const userSubscriptions = await Subscription.find({
      userId: req.user._id,
    }).select("-_id -__v");
    userSubscriptions.forEach((sub) => {
      trashData.push({ trashType: "subscription", data: sub });
    });
    const trash = await Trash.insertMany(trashData);
    if (trash.length > 0) {
      await Subscription.deleteMany({ userId: req.user._id });
    }

    // creating subscription
    const subs = await Subscription.create({
      userId: req.user._id,
      planId: plan._id,
      startDate: UTCTimestampToLocal(subscription.current_period_start),
      endDate: UTCTimestampToLocal(subscription.current_period_end),
    });
  
    return res.json(
      new ApiResponse(
        200,
        {
          subscription: subs,
        },
        "Subscription created successfully."
      )
    );
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});
const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find();
  return res.json(
    new ApiResponse(200, { plans }, "Plans fetched successfully")
  );
});

export { createSubscription, getAllPlans };
