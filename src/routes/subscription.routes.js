import { Router } from "express";
import { createSubscription } from "../controllers/subscription.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
const router = Router();

router.route("/create").post(subscriber,createSubscription);
export default router;