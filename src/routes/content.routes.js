import { Router } from "express";
import { generateAdCopy, generateAiImage } from "../controllers/content.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
const router = Router();

router.route("/generate-ai-image").post(generateAiImage);
router.route("/generate-adcopy").post(generateAdCopy);
export default router;