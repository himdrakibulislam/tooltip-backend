import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler.js";
import crypto from "crypto";
import passport from "./middlewares/passport.middleware.js";
import session from "express-session";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extend: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// google
app.use(
  session({
    secret: process.env.SESSION_SECRATE,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// routes import
import userRouter from "./routes/user.routes.js";
import { User } from "./models/user.model.js";
// routes declaration
app.use("/api/v1/users", userRouter);
app.get("/", async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  
  var token = crypto.randomBytes(64).toString("hex");
  return res
    .status(200)
    .cookie("sc", token, options)
    .json("welcome to tooltip.");
}); 

app.use(errorHandler);
export { app };
