// checkUserOrAuthor.js

import { checkUserToken, checkAuthorToken } from "./authMiddleware.js";

const checkUserOrAuthorToken = async (req, res, next) => {
  console.log("checkUser OrAuthorToken middleware called");
  try {
    // First, try to verify the user token
    await checkUserToken(req, res, next);
    console.log("User token is valid");
  } catch (userError) {
    console.log("User token verification failed, trying author token...");
    // If user verification fails, try verifying the author token
    try {
      req.user = undefined; // Clear req.user to avoid conflicts
      await checkAuthorToken(req, res, next);
      console.log("Author token is valid");
    } catch (authorError) {
      console.error("Author token verification failed:", authorError);
      return res.status(401).json({ message: "Not authorized" }); // Return error response
    }
  }
};

export { checkUserOrAuthorToken };
