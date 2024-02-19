import jwt from "jsonwebtoken";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { allMail } from "../../utils/mail.conf.js";

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Admin does not exist.");
  }
  if(!user.email_verified_at){
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
    await User.findByIdAndUpdate(
        user?._id,
        {
          $unset: {
            pin: 1,
          },
        },
        { new: true }
      );
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
      return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "Admin Logged Out!."));
});

export { adminLogin, verifyAdminLoginOtp, getAdmin,logoutAdmin};
