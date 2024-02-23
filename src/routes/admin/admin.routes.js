import { Router } from "express";
import { adminLogin, verifyAdminLoginOtp,getAdmin, logoutAdmin, getPlans, editPlan, getUsers,getAUser, adminDashboard, getContents, getSubscriptions } from "../../controllers/admin/admin.controller.js";
import { verifyAdminJWT } from "../../middlewares/admin/admin.middleware.js";
const router = Router();

router.route("/login").post(adminLogin);
router.route("/verify-login-otp").post(verifyAdminLoginOtp);
router.route("/current-admin").get(verifyAdminJWT,getAdmin);
router.route("/logout").post(verifyAdminJWT,logoutAdmin);

// dashboard
router.route("/dashboard").get(verifyAdminJWT,adminDashboard);
//plan 
router.route("/plans").get(verifyAdminJWT,getPlans);
router.route("/plan/edit/:id").put(verifyAdminJWT,editPlan);
// users
router.route("/users").get(verifyAdminJWT,getUsers);
router.route("/user/:id").get(verifyAdminJWT,getAUser);
// contents 
router.route("/contents").get(verifyAdminJWT,getContents);
//subscriptions
router.route("/subscriptions").get(verifyAdminJWT,getSubscriptions);

export default router;