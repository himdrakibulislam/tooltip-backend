import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler.js";
import passport from "./middlewares/passport.middleware.js";
import session from "express-session";
import rateLimit from "express-rate-limit";

import { verifyJWT,verified} from "./middlewares/auth.middleware.js";

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

app.use(limiter);
// routes import
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription",verifyJWT,verified, subscriptionRouter);


app.use(errorHandler);
export { app };
