import jwt from "jsonwebtoken";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { allMail } from "../../utils/mail.conf.js";
import { Plan } from "../../models/plan.model.js";
import { Content } from "../../models/content.model.js";
import { Subscription } from "../../models/subscription.model.js";
import mongoose from "mongoose";
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Admin does not exist.");
  }
  if (!user.email_verified_at) {
    throw new ApiError(400, "E-mail is't verified.");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid admin credentials.");
  }
  if (user.role !== "Admin") {
    throw new ApiError(400, "Invalid Request");
  }
  const pin = Math.floor(Math.random() * 9000) + 1000;

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRATE,
    { expiresIn: "10m" }
  );
  await allMail(
    user.email,
    "Admin Login PIN",
    `<div>
  <h2>Hi, ${user.fullName}</h2>
  <p>Please use the below pin to login as admin</p>
  <h3>${pin}</h3></div>`
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  user.pin = pin;
  await user.save({ validateBeforeSave: false });
  return res
    .cookie("pt", token, options)
    .json(
      new ApiResponse(200, { pt: token }, "OTP has been sent to your E-mail.")
    );
});

const verifyAdminLoginOtp = asyncHandler(async (req, res) => {
  const token = req.cookies?.pt || req.token;
  const { pin } = req.body;
  if (!token || !pin) {
    throw new ApiError(401, "All fields are required.");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE);
    const user = await User.findOne({ email: decodedToken.email });

    if (user.pin !== pin) {
      return res.json(new ApiResponse(401, {}, "PIN number mismatch."));
    }

    const accessTokentoken = user.generateAccessToken();
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .cookie("accessToken", accessTokentoken, options)
      .clearCookie("pt", options)
      .json(
        new ApiResponse(
          200,
          { accessToken: accessTokentoken },
          "Admin login successfully."
        )
      );
  } catch (error) {
    if (error?.message === "jwt expired") {
      throw new ApiError(402, "OTP has Expired");
    }
  }
});
const getAdmin = asyncHandler(async (req, res) => {
  return res.json(
    new ApiResponse(200, { admin: req.admin }, "Admin fetched successfully.")
  );
});
const logoutAdmin = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  await User.findByIdAndUpdate(
    req?.admin?._id,
    {
      $unset: {
        pin: 1,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Admin Logged Out!."));
});
// dashboard
const adminDashboard = asyncHandler(async (req, res) => {
  const totalAmount = await Subscription.aggregate([
    {
      $match: { isActive: true },
    },

    {
      $lookup: {
        from: "plans",
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    // Unwind the plan array
    { $unwind: "$plan" },

    {
      $project: {
        _id: 0,
        userId: 1,
        planId: 1,
        price: "$plan.price",
      },
    },
    // Group by userId and calculate total amount
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$price" },
      },
    },
  ]);
  const totalSubscription = await Subscription.countDocuments();
  const totalContent = await Content.countDocuments();
  const totalUsers = await User.countDocuments();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalAmount, totalSubscription, totalContent, totalUsers },
        "Admin dashboard."
      )
    );
});

// plans
const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({});
  return res.status(200).json(new ApiResponse(200, { plans }, "All plans!."));
});
const editPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    throw new ApiError(401, "Invalid Object ID");
  }
  const plan = await Plan.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  return res.status(200).json(new ApiResponse(200, { plan }, "plan updated."));
});
// users
const getUsers = asyncHandler(async (req, res) => {
  const { page } = req.query;

  const pageNo = page && parseInt(page) > 0 ? parseInt(page) : 1;

  const limit = 10;
  const skip = (pageNo - 1) * limit;
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("-password -refreshToken -role -social_login")
    .skip(skip)
    .limit(limit);
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, totalUsers, totalPages },
        "Users fetched successfully."
      )
    );
});
const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
  if (!isValidObjectId) {
    throw new ApiError(401, "Invalid Object ID");
  }

  const user = await User.findById(id);
  const contentCount = await Content.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(user._id) }, // Match content by user ID
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 }, // Count the number of documents
      },
    },
  ]);
  const subscriptions = await Subscription.find({ userId: id });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, contentCount, subscriptions },
        "User fetched successfully."
      )
    );
});
// get all contents
const getContents = asyncHandler(async (req, res) => {
  const { page } = req.query;
  const pageNo = page && parseInt(page) > 0 ? parseInt(page) : 1;

  const limit = 10;
  const skip = (pageNo - 1) * limit;
  const contents = await Content.find()
    .sort({ createdAt: -1 })
    // .select("")
    .skip(skip)
    .limit(limit);
  const totalContents = await Content.countDocuments();
  const totalPages = Math.ceil(totalContents / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { contents, totalContents, totalPages },
        "Contents fetched successfully."
      )
    );
});
// get all subscriptions
const getSubscriptions = asyncHandler(async (req, res) => {
  const { page } = req.query;
  const pageNo = page && parseInt(page) > 0 ? parseInt(page) : 1;

  const limit = 10;
  const skip = (pageNo - 1) * limit;
 
  const subscriptions = await Subscription.aggregate([
    // Sort the subscriptions by createdAt in descending order
    { $sort: { createdAt: -1 } },
    // Skip and limit based on pagination
    { $skip: skip },
    { $limit: limit },
    // Lookup to join with the User collection
    {
      $lookup: {
        from: "users", // Assuming the name of the User collection is "users"
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    // Unwind the user array created by the lookup
    { $unwind: "$user" },
    // Project to include required fields
    {
      $project: {
        _id: 1,
        userId: 1,
        userName: "$user.fullName", // Assuming the name field exists in the User schema
        planId: 1,
        startDate: 1,
        endDate: 1,
        isActive: 1
      }
    }
  ]);
    
  const totalSubscription = await Subscription.countDocuments();
  const totalPages = Math.ceil(totalSubscription / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriptions, totalSubscription, totalPages },
        "Subscriptions fetched successfully."
      )
    );
});

export {
  adminLogin,
  verifyAdminLoginOtp,
  getAdmin,
  logoutAdmin,
  adminDashboard,
  getPlans,
  editPlan,
  getUsers,
  getAUser,
  getContents,
  getSubscriptions,
};
