import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { allMail } from "../utils/mail.conf.js";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    profile : {
      type: String,
    },
    email_verified_at: {
      type: Date
    },
    social_login:{
      type : Boolean,
      default : false,   
    },
    type:{
      type : String,
      default : "EMAIL",   
    },
    profession: {
      type: String,
    },
    aboutme: {
      type: String
    },
    password: {
      type: String,
      // required: [true, 'Password is required']
      required : function () {
        // Password is required only if it's not a social login
        return !this.social_login;
      },
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      { 
          _id: this._id,
          email: this.email,
          fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRATE,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRARY
      }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRATE,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRARY
      }
  )
}

userSchema.methods.sendEmailVerificationNotification = async function(){
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRATE,
    { expiresIn: "15m" }
  );
  const url = process.env.CORS_ORIGIN +`/user/verify-email?verify=${token}` ;
  const content = `<h4>Hello ${this.fullName},</h4>
  <p>Thank you for registering with us. To complete your registration and activate your account, please click
    the link below to verify your email address.</p>

  <button class="btn"><a href="${url}" class="btn" target="_blank">Verify</a></button>

  <p>If you did not register for an account, please disregard this email.</p>
  <h4>Best regards,</h4>
  <h5>Tooltip</h5>`;
  await allMail(this.email,"Verify Your Email Address",content);
}

export const User = mongoose.model("User", userSchema);
