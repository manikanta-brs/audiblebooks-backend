// import express from "express";
// import {
//   addRating,
//   editRating,
//   removeRating,
//   deleteAudiobook,
//   getAudiobooks,
//   updateAudiobook,
//   getAudiobookById,
//   getAudiobooksByCategory,
//   getCategories, // Import the getCategories function
//   searchAudiobooks,
//   uploadAudiobook,
//   getAudiobookCoverImage,
//   getAudiobooksByAuthor,
//   getAudioFile,
//   getAuthorBooks,
//   getSubcategories,
//   checkRatedOrNot,
// } from "../controllers/audiobookController.js";
// import processImage from "../middlewares/imageProcessingMiddleware.js";
// import {
//   checkAuthorToken,
//   checkUserToken,
// } from "../middlewares/authMiddleware.js";
// import optimizeAudio from "../middlewares/audioOptimizationMiddleware.js";
// import { upload } from "../controllers/gridfs.js";
// import asyncHandler from "express-async-handler";
// const router = express.Router();

// // Public routes (no authentication required)
// router.get("/getbooks", getAudiobooks);
// router.get("/cover-image/:filename", getAudiobookCoverImage);
// router.get("/search", searchAudiobooks);
// router.get("/category/:category", getAudiobooksByCategory);

// router.post(
//   "/uploadaudiobook",
//   checkAuthorToken, // Check authentication first
//   upload, // Apply the multer middleware here**
//   processImage,
//   uploadAudiobook // Then call your controller
// );
// router.delete("/:id/delete", checkAuthorToken, deleteAudiobook); // Changed route
// // Add this debug section

// router.put(
//   "/:id/update",
//   checkAuthorToken,
//   upload,
//   asyncHandler(updateAudiobook)
// );
// router.get("/:id/get", checkAuthorToken, getAudiobookById); // Changed route
// router.get("/:id/getbyauthor", getAudiobooksByAuthor); // Changed route
// router.get("/authorbooks/:authorId", getAuthorBooks);
// // User rating route
// router.put("/:id/review/user", checkUserToken, addRating);
// router.get(
//   "/:audiobookId/rated", // Corrected route path
//   (req, res, next) => {
//     // Combined authentication middleware
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       const token = req.headers.authorization.split(" ")[1];

//       try {
//         const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = { _id: decodedUser.userId }; // Assuming payload has userId for User
//         return next(); // Pass control to checkRatedOrNot
//       } catch (userError) {
//         try {
//           const decodedAuthor = jwt.verify(token, process.env.JWT_SECRET);
//           req.author = { _id: decodedAuthor.authorId }; // Assuming payload has authorId for Author
//           return next(); // Pass control to checkRatedOrNot
//         } catch (authorError) {
//           console.error(
//             "User and Author token verification failed. Invalid Token"
//           );
//           return res
//             .status(401)
//             .json({ message: "Not authorized, invalid token" });
//         }
//       }
//     } else {
//       return res.status(401).json({ message: "Not authorized, no token" });
//     }
//   },

//   checkRatedOrNot
// );
// // Author rating route
// router.put("/:id/review/author", checkAuthorToken, addRating);

// // User remove a rating
// router.delete("/:id/review/user", checkUserToken, removeRating);

// // Author remove a rating
// router.delete("/:id/review/author", checkAuthorToken, removeRating);

// // User Route to edit a rating
// router.put("/:id/review/user", checkUserToken, editRating);

// // Author Route to edit a rating
// router.put("/:id/review/author", checkAuthorToken, editRating);
// router.get("/audio/:filename", getAudioFile); // The new audio file route
// router.get("/categories", getCategories);
// router.get("/subcategories", getSubcategories);
// // router.put()

// export default router;

import express from "express";
import {
  addRating,
  deleteAudiobook,
  getAudiobooks,
  updateAudiobook,
  getAudiobookById,
  getAudiobooksByCategory,
  getCategories,
  searchAudiobooks,
  uploadAudiobook,
  getAudiobookCoverImage,
  getAudiobooksByAuthor,
  getAudioFile,
  getAuthorBooks,
  getSubcategories,
  getUserRating,
} from "../controllers/audiobookController.js";
import processImage from "../middlewares/imageProcessingMiddleware.js";
import {
  checkAuthorToken,
  checkAuthToken,
  checkUserToken,
} from "../middlewares/authMiddleware.js";
import { upload } from "../controllers/gridfs.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// Public routes (no authentication required)
router.get("/getbooks", getAudiobooks);
router.get("/cover-image/:filename", getAudiobookCoverImage);
router.get("/search", searchAudiobooks);
router.get("/category/:category", getAudiobooksByCategory);

router.post(
  "/uploadaudiobook",
  checkAuthorToken, // Check authentication first
  upload, // Apply the multer middleware here**
  processImage,
  uploadAudiobook // Then call your controller
);
router.delete("/:id/delete", checkAuthorToken, deleteAudiobook); // Changed route
// Add this debug section

router.put(
  "/:id/update",
  checkAuthorToken,
  upload,
  asyncHandler(updateAudiobook)
);
router.get("/:id/get", checkAuthorToken, getAudiobookById); // Changed route
router.get("/:id/getbyauthor", getAudiobooksByAuthor); // Changed route
router.get("/authorbooks/:authorId", getAuthorBooks);
router.get("/audio/:filename", getAudioFile); // The new audio file route
router.get("/categories", getCategories);
router.get("/subcategories", getSubcategories);
// User rating route
router.put("/review", checkAuthToken, addRating);

router.post("/getrating", checkAuthToken, getUserRating);

export default router;
