// authMiddleware.js
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Author from "../models/authorModel.js";
import expressAsyncHandler from "express-async-handler";

const checkUserToken = expressAsyncHandler(async (req, res, next) => {
  console.log("JWT_SECRET in authMiddleware:", process.env.JWT_SECRET); // Add this line
  console.log(
    "checkUserToken - Authorization Header:",
    req.headers.authorization
  ); // ADD THIS

  let token;
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];

    try {
      console.log("Attempting to verify token:", token); // Add this
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Verified Token (User):", decoded); // ADDED

      if (decoded.userId) {
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
          res.status(404);
          return next(new Error("User not found"));
        }
        req.user = user; // Attach user object to the request
        next();
      } else {
        res.status(401);
        return next(new Error("Not authorized, invalid token"));
      }
    } catch (error) {
      console.error("Token verification failed:", error.message); // Add this
      if (error.name === "TokenExpiredError") {
        res.status(401);
        return next(new Error("Not authorized, token expired"));
      } else {
        res.status(401);
        return next(new Error("Not authorized, invalid token"));
      }
    }
  } else {
    res.status(401);
    return next(new Error("Not authorized, token is required"));
  }
});

const checkAuthorToken = expressAsyncHandler(async (req, res, next) => {
  console.log("Authentication Middleware - req.author:", req.author);
  let token;
  const authorizationHeader = req.headers.authorization;
  console.log("Authorization Header:", req.headers.authorization);

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Verified Token (Author):", decodedToken); // ADDED
      console.log(`Printing authorid values here --> ${decodedToken.authorId}`); // ADDED

      // Check if author exists in the database
      const author = await Author.findById(decodedToken.authorId).select(
        "-password"
      );

      if (!author) {
        res.status(404);
        return next(new Error("Author not found"));
      }

      // Attach the author object to the request
      req.author = author;
      console.log("Author attached to request:", req.author);
      next();
    } catch (error) {
      res.status(401);
      return next(new Error("Not authorized, invalid token"));
    }
  } else {
    res.status(401);
    return next(new Error("Not authorized, token is required"));
  }
});

export { checkUserToken, checkAuthorToken };
