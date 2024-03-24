import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  destroyFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { allMail } from "../utils/mail.conf.js";
import { Content } from "../models/content.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import moment from "moment";
const generateAccessAndRefershToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error.message);
    throw new ApiError(500, "Something Went Wrong!");
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body;

  if (
    [fullName, email, password].some((field) => !field || field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong when registering user.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefershToken(
    createdUser._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  const refreshOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 10 * 24 * 60 * 60 * 1000 
  }
  await createdUser.sendEmailVerificationNotification();
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "User registered successfully."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new ApiError(400, "email or password is required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exist.");
  }
  if (user.social_login) {
    throw new ApiError(
      400,
      `User Already Sign Up With ${user.type}. Please Sign up with ${user.type}`
    );
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefershToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refershToken"
  );

  const options = {
    httpOnly: true,
    secure: true
  };
 const refreshOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 10 * 24 * 60 * 60 * 1000 
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const signInWithGoogle = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await generateAccessAndRefershToken(
    req.user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(process.env.CORS_ORIGIN);
});
const logoutUser = asyncHandler(async (req, res) => {
  if (req?.user?.social_login) {
    req.logout((err) => {
      if (err) {
        throw new ApiError(500, "Internal Server Error.");
      }
    });
  }

  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out!."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRATE
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } =
      await generateAccessAndRefershToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new password is required.");
  }
  const user = await User.findById(req.user?._id);
  if (user.social_login) {
    throw new ApiError(400, "You can't change password.");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, profession, aboutme } = req.body;

  if (!fullName) {
    throw new ApiError(400, "fullName is required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        profession,
        aboutme,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const changeProfile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Profile is required.");
  }

  if (req?.user?.profile) {
    await destroyFromCloudinary(req.user.profile);
  }
  const response = await uploadOnCloudinary(req.file.path);
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profile: response.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(401, "E-mail is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid e-mail address.");
  }
  if (user.social_login) {
    throw new ApiError(401, "This user can't reset password.");
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRATE,
    { expiresIn: "15m" }
  );
  const resetURL = `${process.env.CORS_ORIGIN}/password-reset/${token}`;
  // required parameter send to, subject , content
  const response = await allMail(
    user.email,
    "Reset Password",
    `<div>
  <h4>Hi, ${user.fullName}</h4>
  <h5>To reset password</h5>
  <a href='${resetURL}' class='btn btn-info btn-sm'>RESET PASSWORD</a>
  <p>If the link doesn't work click here </p>
  <a href='${resetURL}'>Click</a>
  </div>`
  );

  return res.json(
    new ApiResponse(
      200,
      {},
      "The password reset link has been sent to your email. please, Check your email."
    )
  );
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) {
    throw new ApiError(401, "Password or token is required.");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE);
    const user = await User.findOne({ email: decodedToken.email });
    user.password = password;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    if (error?.message === "jwt expired") {
      throw new ApiError(402, "Token has Expired");
    }
  }

  return res.json(
    new ApiResponse(200, {}, "The password has been reset successfully.")
  );
});
const resendVerificationMail = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.email_verified_at) {
    throw new ApiError(401, "Email Already Verified.");
  }
  await user.sendEmailVerificationNotification();
  return res.json(
    new ApiResponse(
      200,
      {},
      "A verification link has been sent successfully to your email."
    )
  );
});
const verifyUserEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(402, "Token is required.");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE);
    const user = await User.findById(decodedToken._id);
    if (user.email_verified_at) {
      return res.json(new ApiResponse(401, {}, "Email Already Verified."));
    }
    await User.findByIdAndUpdate(decodedToken?._id, {
      $set: {
        email_verified_at: new Date().getTime(),
      },
    });
  } catch (error) {
    if (error?.message === "jwt expired") {
      throw new ApiError(402, "Token has Expired");
    }
  }

  return res.json(new ApiResponse(200, {}, "E-mail verified successfully."));
});
// ------ user --------
const contentDashboard = asyncHandler(async (req, res) => {
  const currentMonthStart = moment().startOf("month").toDate();
  const currentMonthEnd = moment().endOf("month").toDate();
  const typeOfContentPipeline = [
    {
      $match: {
        userId: req.user._id,
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },

    {
      $project: {
        _id: 0,
        type: "$_id", // Rename _id field to date
        count: 1, // Include the count field
      },
    },
  ];
  const dailyContentPipeline = [
    {
      $match: {
        userId: req.user._id,
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }, // Filter documents for the current month
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date in "YYYY-MM-DD" format
        count: { $sum: 1 }, // Count the number of documents for each date
      },
    },
    {
      $sort: { _id: 1 }, // Sort the results by date in ascending order
    },
    {
      $project: {
        _id: 0,
        date: "$_id", // Rename _id field to date
        count: 1, // Include the count field
      },
    },
  ];
  // Execute the aggregation pipeline
  const typeOfContent = await Content.aggregate(typeOfContentPipeline);
  const dailyContentCount = await Content.aggregate(dailyContentPipeline);
  return res.json(
    new ApiResponse(200, { typeOfContent, dailyContentCount }, "Dashboard.")
  );
});
const getContents = asyncHandler(async (req, res) => {
  const { type, page } = req.query;
  const pageNo = page && page > 0 ? parseInt(page) : 1;

  const limit = 10;
  const skip = (pageNo - 1) * limit;

  const matchObject = { userId: new mongoose.Types.ObjectId(req.user._id) };
  if (type) {
    matchObject.type = type;
  }
  const contents = await Content.aggregate([
    {
      $facet: {
        totalContent: [
          {
            $match: matchObject,
          },
          {
            $count: "total",
          },
        ],
        data: [
          {
            $match: matchObject,
          },
          {
            $project: {
              userId: 0, // Exclude userId field
            },
          },
          {
            $sort: {
              // Sorting by a field in ascending order
              createdAt: -1, // or -1 for descending order
            },
          },
          {
            $skip: skip, // Skip documents based on pagination
          },
          {
            $limit: limit, // Limit the number of documents per page
          },
        ],
      },
    },
  ]);
  // count total pages
  const totalContentCount = contents[0]?.totalContent[0]?.total; // Total number of documents
  const totalPages = Math.ceil(totalContentCount / limit);

  return res.json(new ApiResponse(200, { contents, totalPages }, "Contents."));
});
const getUserSubscriptions = asyncHandler(async (req, res) => {
  const aggregationPipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "plans", // Name of the Plan collection
        localField: "planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $unwind: "$plan",
    },
    {
      $project: {
        userId: 1,
        planId: 1,
        startDate: 1,
        endDate: 1,
        plan: {
          _id: "$plan._id",
          name: "$plan.title",
          price: "$plan.price",
          content: "$plan.content",
        },
      },
    },
  ];
  const subscription = await Subscription.aggregate(aggregationPipeline);
  let subscriptionRemainingDays = 0;
  let isActive = false;

  if (subscription.length > 0) {
    const currentDate = moment();
    const endDate = moment(subscription[0].endDate);

    // Find the difference in days
    subscriptionRemainingDays = endDate.diff(currentDate, "days");
    isActive = subscription[0].endDate ? subscription[0].endDate > Date.now() : false;
  }

  return res.json(
    new ApiResponse(
      200,
      { subscription, subscriptionRemainingDays,isActive },
      "User Subscription."
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  signInWithGoogle,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  changeProfile,
  forgotPassword,
  resetPassword,
  resendVerificationMail,
  verifyUserEmail,
  contentDashboard,
  getContents,
  getUserSubscriptions,
};
