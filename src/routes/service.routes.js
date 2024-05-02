import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { imageToPDF } from "../controllers/service.controller.js";
const router = Router();

// router.route("/image-to-pdf").post(upload.single('image'),imageToPDF);
 
export default router;