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
    origin: [process.env.CORS_ORIGIN,process.env.CORS_ORIGIN_ADMIN],
    credentials: true,
  })
);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
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
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

app.use(limiter);
// routes import
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import contentRouter from "./routes/content.routes.js";
// admin 
import adminRouter from "./routes/admin/admin.routes.js";


// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/content",verifyJWT,verified, contentRouter);

// admin routes
app.use("/api/v1/admin", adminRouter);
app.use(errorHandler);
export { app };
