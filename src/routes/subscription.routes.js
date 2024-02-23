import { Router } from "express";
import { createSubscription, getAllPlans } from "../controllers/subscription.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
import { verified, verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/plans").get(getAllPlans);
router.route("/create").post(verifyJWT,verified,createSubscription);
export default router;