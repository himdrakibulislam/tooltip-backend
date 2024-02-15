import { Router } from "express";
import { generateAdCopy, generateAiImage } from "../controllers/content.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/audio-transcription").post(upload.single('audio'),generateAiImage);
router.route("/generate-adcopy").post(generateAdCopy);
export default router;