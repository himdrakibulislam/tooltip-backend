import { Router } from "express";
import { adminLogin, verifyAdminLoginOtp,getAdmin, logoutAdmin } from "../../controllers/admin/admin.controller.js";
import { verifyAdminJWT } from "../../middlewares/admin.middleware.js";
const router = Router();

router.route("/login").post(adminLogin);
router.route("/verify-login-otp").post(verifyAdminLoginOtp);
router.route("/current-admin").get(verifyAdminJWT,getAdmin);
router.route("/logout").post(verifyAdminJWT,logoutAdmin);

export default router;