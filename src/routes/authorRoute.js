import express from "express";

import {
  createAuthor,
  loginAuthor,
  verifyAuthorEmail,
  getAuthorProfile,
  updateAuthorProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  getAuthors,
} from "../controllers/authorController.js";
import { checkAuthorToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth & Profile Routes
router.post("/register", createAuthor);
router.get("/verifyEmail/:verifyToken", verifyAuthorEmail);
router.post("/login", loginAuthor);
router.get("/profile", checkAuthorToken, getAuthorProfile);
router.get("/getauthors", getAuthors);

router.put("/profile", checkAuthorToken, updateAuthorProfile);
router.put("/updatepassword", checkAuthorToken, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

export default router;
