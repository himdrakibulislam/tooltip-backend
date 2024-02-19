import { Router } from "express";
import { deleteContent, generateAdCopy, generateAudioTranscript } from "../controllers/content.controller.js";
import  {subscriber}  from "../middlewares/subscriber.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/audio-transcription").post(upload.single('audio'),generateAudioTranscript);
router.route("/generate-adcopy").post(generateAdCopy);
router.route("/delete-content/:id").delete(deleteContent);
export default router;