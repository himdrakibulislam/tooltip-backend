import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorHandler } from "./utils/errorHandler.js";
import crypto from "crypto";
const app = express(); 
app.use(cors({  
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extend:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
// routes import  
import userRouter from "./routes/user.routes.js";

// routes declaration 
app.use("/api/v1/users",userRouter);
app.get('',(req,res)=>{
    const options = {
    
        httpOnly: true,
        secure: true
       }
       var token = crypto.randomBytes(64).toString('hex');

    return res.status(200)
    .cookie("sitecookie",token,options)
    .json("welcome to tooltip.")
})


app.use(errorHandler);
export {app};