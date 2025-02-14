import express from "express";
import {
  createUser,
  generateSpotifyRefreshToken,
  loginUser,
  verifyEmail,
  getUserProfile,
  updateUserProfile,
  updatePreferredLanguage,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveSpotifyStory,
  removeSpotifyStory,
  getSpotifyStories,
} from "../controllers/userController.js";
import { checkUserToken } from "../middlewares/authMiddleware.js";
// import { Route } from "express";

const router = express.Router();

router.post("/register", createUser);
router.get("/verifyEmail/:verifyToken", verifyEmail);
router.post("/login", loginUser);
router.get("/refreshtoken", checkUserToken, generateSpotifyRefreshToken);
router.get("/profile", checkUserToken, getUserProfile);
router.put("/profile", checkUserToken, updateUserProfile);
router.put("/preferredlanguage", checkUserToken, updatePreferredLanguage);
router.put("/updatepassword", checkUserToken, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
router.post("/savestory", checkUserToken, saveSpotifyStory);
router.delete("/removestory", checkUserToken, removeSpotifyStory);
router.get("/library", checkUserToken, getSpotifyStories);

// Add rating to audiobook

export default router;
