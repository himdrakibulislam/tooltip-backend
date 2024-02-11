import { Router } from "express";
import { generateAiImage } from "../controllers/content.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
const router = Router();

router.route("/generate-ai-image").post(generateAiImage);
export default router;