import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  signInWithGoogle,
  forgotPassword,
  resetPassword,
  changeProfile,
  resendVerificationMail,
  verifyUserEmail,
} from "../controllers/user.controller.js";
import { verifyJWT,verified} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import passport from "../middlewares/passport.middleware.js";
import openai from "../utils/openAI.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/verify-email").post(verifyUserEmail);
// social login
router
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
router
  .route("/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/" }),
    signInWithGoogle
  );

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/verification-notification").post(verifyJWT, resendVerificationMail);

router.route("/change-password").post(verifyJWT,verified, changeCurrentPassword);
router.route("/update-account").patch(verifyJWT,verified,updateAccountDetails);
router.route("/change-profile").post(verifyJWT,verified, upload.single("profile"), changeProfile);

router.route("/chat").post(verifyJWT,verified, async (req, res) => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: req.body.prompt }],
      model: "gpt-3.5-turbo",
    });
    return res.json(chatCompletion?.choices[0]?.message || "");
  } catch (error) {
    
    return res.json({message:"An Error Occured."})
  }
});

export default router;
