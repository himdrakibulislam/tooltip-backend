import { Router } from "express";
import { deleteContent, generateAIBlog, generateAdCopy, generateAudioTranscript } from "../controllers/content.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/audio-transcription").post(upload.single('audio'),generateAudioTranscript);
router.route("/generate-adcopy").post(subscriber,generateAdCopy);
router.route("/generate-ai-blog").post(upload.single("productImage"),generateAIBlog);
router.route("/delete-content/:id").delete(deleteContent);
export default router;