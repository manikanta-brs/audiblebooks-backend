import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendEmailVerificationLink,
  sendPasswordResetLink,
  sendVerificationCode,
  sendPasswordResetVerificationCode,
} from "../utils/utils.js";
import SpotifyWebApi from "spotify-web-api-node";
import Language from "../models/languageModel.js";
import Audiobook from "../models/audiobookModel.js";

// To check user agent info
const getDevice = (req, res) => {
  console.log(`User-Agent Source: ${req.useragent.source}`);
  console.log(`Is Mobile: ${!req.useragent.isMobile}`);
  console.log(`Is Desktop: ${req.useragent.isDesktop}`);
  console.log(`Is Bot: ${req.useragent.isBot}`);
  res.send(req.useragent.source);
};

const createUser = async (req, res, next) => {
  const avatarImages = [
    "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    "https://cdn-icons-png.flaticon.com/512/1326/1326377.png",
    "https://cdn-icons-png.flaticon.com/512/2632/2632839.png",
    "https://cdn-icons-png.flaticon.com/512/3940/3940403.png",
    "https://cdn-icons-png.flaticon.com/512/3940/3940417.png",
    "https://cdn-icons-png.flaticon.com/512/1326/1326405.png",
    "https://cdn-icons-png.flaticon.com/512/1326/1326390.png",
    "https://cdn-icons-png.flaticon.com/512/1760/1760998.png",
  ];
  // Select a random avatar
  const randomAvatar =
    avatarImages[Math.floor(Math.random() * avatarImages.length)];

  const { first_name, last_name, email, password } = req.body;
  console.log("Received registration request:", req.body); // LOGGING

  try {
    if (!first_name || !last_name || !email || !password) {
      const err = new Error(
        "Firstname, Lastname, Email and Password is required"
      );
      err.statusCode = 400;
      console.error("Missing required fields:", err.message); // LOGGING
      return next(err);
    }

    // Check for valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error("Invalid email address");
      err.statusCode = 400; // Set status code
      console.error("Invalid email format:", email); //LOGGING
      return next(err);
    }

    // Check for existing user
    console.log("Checking if user exists with email:", email); // LOGGING
    const userExists = await User.findOne({ email });
    if (userExists) {
      const err = new Error(
        "User with this email already exists. Please use a different email address"
      );
      err.statusCode = 409; //Corrected
      console.error("User already exists:", email); //LOGGING
      return next(err);
    }

    // Hash password
    console.log("Hashing password..."); // LOGGING
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully."); // LOGGING

    // Generate token
    console.log("Generating JWT token..."); //LOGGING
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    console.log("JWT token generated:", token); // LOGGING

    // Send verification email
    console.log("Sending verification email..."); // LOGGING
    const verificationEmailResponse = await sendEmailVerificationLink(
      email,
      token,
      first_name,
      "users"
    );
    console.log("Verification email response:", verificationEmailResponse); // LOGGING

    // Handle email sending error
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send verification email, please try again later"
      );
      err.statusCode = 500;
      console.error("Failed to send verification email:", err); // LOGGING
      return next(err);
    }

    // Save user to DB
    console.log("Saving user to database..."); // LOGGING
    await User.create({
      avatar: randomAvatar,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      verify_token: token,
      verify_token_expires: Date.now() + 7200000, // 2 hours
    });
    console.log("User saved to database successfully."); // LOGGING

    // Respond with success message
    console.log("Registration successful, sending response..."); // LOGGING
    res.status(201).json({
      message:
        "Registered successfully. Please check your email to verify the account",
    });
    console.log("Response sent successfully."); // LOGGING
  } catch (error) {
    console.error("An error occurred:", error); // LOGGING THE FULL ERROR
    return next(error);
  }
};

// const createUser = async (req, res, next) => {
//   const avatarImages = [
//     "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
//     "https://cdn-icons-png.flaticon.com/512/1326/1326377.png",
//     "https://cdn-icons-png.flaticon.com/512/2632/2632839.png",
//     "https://cdn-icons-png.flaticon.com/512/3940/3940403.png",
//     "https://cdn-icons-png.flaticon.com/512/3940/3940417.png",
//     "https://cdn-icons-png.flaticon.com/512/1326/1326405.png",
//     "https://cdn-icons-png.flaticon.com/512/1326/1326390.png",
//     "https://cdn-icons-png.flaticon.com/512/1760/1760998.png",
//   ];
//   // Select a random avatar
//   const randomAvatar =
//     avatarImages[Math.floor(Math.random() * avatarImages.length)];

//   const { first_name, last_name, email, password } = req.body;
//   try {
//     if (!first_name || !last_name || !email || !password) {
//       const err = new Error(
//         "Firstname, Lastname, Email and Password is required"
//       );
//       err.statusCode = 400;
//       return next(err);
//     }

//     // Check for valid email address
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       const err = new Error("Invalid email address");
//       res.status(400);
//       return next(err);
//     }

//     // Check for existing user
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       res.status(409);
//       const err = new Error(
//         "User with this email already exists. Please use a different email address"
//       );
//       err.statusCode = 409;
//       return next(err);
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate token
//     const token = jwt.sign({ email }, process.env.JWT_SECRET, {
//       expiresIn: "2h",
//     });

//     // Send verification email
//     const verificationEmailResponse = await sendEmailVerificationLink(
//       email,
//       token,
//       first_name,
//       "users"
//     );

//     // Handle email sending error
//     if (verificationEmailResponse.error) {
//       const err = new Error(
//         "Failed to send verification email, please try again later"
//       );
//       err.statusCode = 500;
//       return next(err);
//     }

//     // Save user to DB
//     await User.create({
//       avatar: randomAvatar,
//       first_name,
//       last_name,
//       email,
//       password: hashedPassword,
//       verify_token: token,
//       verify_token_expires: Date.now() + 7200000, // 2 hours
//     });

//     // Respond with success message
//     res.status(201).json({
//       message:
//         "Registered successfully. Please check your email to verify the account",
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
// const verifyEmail = async (req, res, next) => {
//   try {
//     // Find user based on verification token
//     const user = await User.findOne({ verify_token: req.params.verifyToken });
//     if (!user) {
//       // If user not found
//       return res.status(409).send("Invalid token.");
//     } else if (user.verify_token_expires <= Date.now()) {
//       if (!user.verified) {
//         // Only delete the user if not already verified
//         await user.deleteOne(); // Remove the user
//         return res
//           .status(409)
//           .send("Verification link has expired. Register again.");
//       } else {
//         return res.status(400).send("Please login to continue.");
//       }
//     } else if (user.verified === true) {
//       // If user is already verified
//       return res
//         .status(200)
//         .json({ message: "Email is already verified. Please Login." });
//     } else {
//       // If token is still valid, mark user as verified
//       user.verified = true;
//       await user.save();
//       return res
//         .status(201)
//         .json({ message: "Email is verified. Please Login." });
//     }
//   } catch (error) {
//     return next(error);
//   }
// };

// resend otp

// ... existing code ...

const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verify_token: req.params.verifyToken });

    // Check if the request wants JSON (like from Postman or API calls)
    const wantsJson =
      req.headers.accept && req.headers.accept.includes("application/json");

    if (!user) {
      const response = {
        success: false,
        message: "Invalid verification token.",
      };

      return wantsJson
        ? res.status(400).json(response)
        : res.render("email_verified", response);
    }

    if (user.verify_token_expires <= Date.now()) {
      if (!user.verified) {
        await user.deleteOne();
      }
      const response = {
        success: false,
        message: "Verification token has expired.",
      };

      return wantsJson
        ? res.status(400).json(response)
        : res.render("email_verified", response);
    }

    if (user.verified) {
      const response = {
        success: true,
        message: "Email already verified. Please login to continue.",
      };

      return wantsJson
        ? res.status(200).json(response)
        : res.render("email_verified", response);
    }

    // Verify the user
    user.verified = true;
    user.verify_token = undefined;
    user.verify_token_expires = undefined;
    await user.save();

    const response = {
      success: true,
      message: "Email verified successfully. Please login to continue.",
    };

    return wantsJson
      ? res.status(200).json(response)
      : res.render("email_verified", response);
  } catch (error) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ... existing code ...
const resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  const generatedCode = Math.floor(1000 + Math.random() * 9000);

  // check for user
  const user = await User.findOne({ email });
  if (user) {
    const verificationEmailResponse = await sendVerificationCode(
      user.first_name,
      user.email,
      generatedCode
    );

    // send mail - handle err
    if (verificationEmailResponse.error) {
      console.log(verificationEmailResponse.error);
      const err = new Error(
        "Failed to send verification code, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    (user.otp = generatedCode), (user.otp_expires_in = Date.now() + 7200000);
    await user.save();
    return res.status(200).json({
      message: "Verification code resent successfully. Please verify",
    });
  }
  res.status(404);
  const err = new Error("User not found. Please register");
  err.statusCode = 404;
  return next(err);
};

// resend otp
const sendPasswordVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  const generatedCode = Math.floor(1000 + Math.random() * 9000);

  // check for user
  const user = await User.findOne({ email });
  if (user) {
    const verificationEmailResponse = await sendPasswordResetVerificationCode(
      user.first_name,
      user.email,
      generatedCode
    );

    // send mail - handle err
    if (verificationEmailResponse.error) {
      console.log(verificationEmailResponse.error);
      const err = new Error(
        "Failed to send password reset verification code, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    (user.reset_password_otp = generatedCode),
      (user.reset_password_otp_expires_in = Date.now() + 7200000);
    await user.save();
    return res.status(200).json({
      message: "Password reset verification code sent successfully.",
    });
  }
  res.status(404);
  const err = new Error("User not found. Please register");
  err.statusCode = 404;
  return next(err);
};

// to verify the code for - new user registration from mobile
const verifyCode = async (req, res, next) => {
  const { email, verificationcode } = req.body;
  console.log(email, verificationcode);
  try {
    const user = await User.findOne({ email, otp: verificationcode });
    if (!user) {
      // If user not found
      return res.status(409).json({ message: "Invalid verification code." });
    }
    if (user.verified) {
      return res
        .status(200)
        .json({ message: "Email is already verified. Please Login." });
    } else {
      user.verified = true;
      await user.save();
      return res
        .status(201)
        .json({ message: "Email is verified. Please Login." });
    }
  } catch (error) {
    return next(error);
  }
};

// reset password from mobile
const resetPasswordFromMobile = async (req, res, next) => {
  const { verificationcode, password } = req.body;
  if (!verificationcode) {
    const err = new Error("Verification code is required");
    err.statusCode = 400;
    return next(err);
  }
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    // find the user by token
    const user = await User.findOne({
      reset_password_otp: verificationcode,
      reset_password_otp_expires_in: { $gt: Date.now() },
    });
    if (!user) {
      const err = new Error(
        "Verification code is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }
    // user found - hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    (user.password = hashedPassword), (user.reset_password_otp = undefined);
    user.reset_password_otp_expires_in = undefined;
    await user.save();
    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.verified) {
      return res
        .status(401)
        .json({ message: "Account not verified. Please verify your email." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const generateSpotifyRefreshToken = async (req, res, next) => {
  try {
    // generate spotify token
    const spotifyAPI = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const spotifyCredentials = await spotifyAPI.clientCredentialsGrant();
    const spotifyToken = spotifyCredentials.body;
    res.status(200).json({ spotifyToken });
  } catch (error) {
    const err = new Error("Something went wrong, please try again later");
    err.statusCode = 500;
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    const profileData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      languages: user.languages,
    };

    res.status(200).json({ profileData });
  } catch (error) {
    return next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }

    if (first_name || last_name) {
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
    }

    if (email && email !== user.email) {
      const userExists = await User.findOne({ email });

      if (userExists) {
        const err = new Error(
          `${email} is already in use, please choose a different one`
        );
        err.statusCode = 409;
        return next(err);
      }
      user.email = email;
    }
    await user.save();
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const updatePreferredLanguage = async (req, res, next) => {
  const { languageIds } = req.body;

  try {
    // Fetch the full language objects based on the provided IDs
    const languages = await Language.find({ languageId: { $in: languageIds } });

    const user = await User.findById(req.user._id); // Assuming you have user info in req.user
    user.languages = languages; // Update the languages array with full language objects
    await user.save();

    res.status(200).json({
      success: true,
      message: "Preferred languages updated successfully.",
      languages: user.languages, // This will now contain full language objects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating preferred languages.",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Email not found");
      err.statusCode = 400;
      return next(err);
    }
    // generate token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save token in DB
    user.reset_password_token = token;
    user.reset_password_expires = Date.now() + 7200000;
    await user.save();
    // send mail
    const verificationEmailResponse = await sendPasswordResetLink(
      email,
      token,
      user.first_name
    );
    // handle err
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send password reset link, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }
    res.status(200).json({
      message: "Password reset link sent successfully, please check your email",
    });
  } catch (error) {
    return next(error);
  }
};

// const resetPassword = async (req, res, next) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   if (!token) {
//     const err = new Error("Token is required");
//     err.statusCode = 400;
//     return next(err);
//   }
//   if (!password) {
//     const err = new Error("Password is required");
//     err.statusCode = 400;
//     return next(err);
//   }
//   try {
//     // find the user by token
//     const user = await User.findOne({
//       reset_password_token: token,
//       reset_password_expires: { $gt: Date.now() },
//     });
//     if (!user) {
//       const err = new Error(
//         "Password reset link is invalid or expired, please try again"
//       );
//       err.statusCode = 400;
//       return next(err);
//     }
//     // user found - hash password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     (user.password = hashedPassword), (user.reset_password_token = undefined);
//     user.reset_password_epxpires = undefined;
//     await user.save();
//     res.status(200).json({
//       message: "Password updated successfully, please login to continue",
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
const resetPassword = async (req, res, next) => {
  const { token } = req.params; // token is passed via URL parameter
  const { password } = req.body;

  if (!token) {
    const err = new Error("Token is required");
    err.statusCode = 400;
    return next(err);
  }
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Find the user by token and check if the reset token has expired
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }, // Check if token is still valid
    });

    // Log the token, current time, and token expiry for debugging
    console.log("Reset Token:", token); // Log the reset token
    console.log("Current Time:", Date.now()); // Log the current time
    console.log("Token Expiry:", user?.reset_password_expires); // Log the token expiry date

    if (!user) {
      console.log("User not found or token expired");

      const err = new Error(
        "Password reset link is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token and expiry
    user.password = hashedPassword;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    // Save the updated user object
    await user.save();

    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error); // Pass any errors to the error-handling middleware
  }
};

const saveSpotifyStory = async (req, res, next) => {
  const { storyId } = req.body;
  if (!storyId) {
    const err = new Error("StoryId is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    if (user.saved_stories.includes(storyId)) {
      return res.status(409).json({ message: "Story already saved" });
    }
    // save story
    user.saved_stories.push(storyId);
    await user.save();
    res.status(200).json({ message: "Story saved successfully" });
  } catch (error) {
    return next(error);
  }
};

const removeSpotifyStory = async (req, res, next) => {
  const { storyId } = req.body;
  if (!storyId) {
    const err = new Error("StoryId is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    const index = user.saved_stories.indexOf(storyId);
    if (index === -1) {
      const err = new Error("Invalid storyId");
      err.statusCode = 404;
      return next(err);
    }
    user.saved_stories.splice(index, 1);
    await user.save();
    res.status(200).json({ message: "Story removed successfully" });
  } catch (error) {
    return next(error);
  }
};

const getSpotifyStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    const stories = user.saved_stories;
    res.status(200).json({ stories });
  } catch (error) {
    return next(error);
  }
};
// Add rating to an audiobook
// const addRating = async (req, res, next) => {
//   const { audiobookId, rating, review } = req.body;
//   const userId = req.user._id;

//   try {
//     // Validate the rating (between 1 and 5)
//     if (rating < 1 || rating > 5) {
//       const err = new Error("Rating must be between 1 and 5");
//       err.statusCode = 400;
//       return next(err);
//     }

//     // Find the audiobook
//     const audiobook = await Audiobook.findById(audiobookId);
//     if (!audiobook) {
//       const err = new Error("Audiobook not found");
//       err.statusCode = 404;
//       return next(err);
//     }

//     // Check if the user has already rated the audiobook
//     const existingRating = audiobook.ratings.find(
//       (rating) => rating.userId.toString() === userId.toString()
//     );
//     if (existingRating) {
//       const err = new Error("You have already rated this audiobook");
//       err.statusCode = 400;
//       return next(err);
//     }

//     // Add the new rating to the array
//     audiobook.ratings.push({ userId, rating, review });

//     // Recalculate and update the average rating
//     await audiobook.calculateAverageRating();

//     // Send the success response
//     res.status(200).json({
//       success: true,
//       message: "Rating added successfully",
//       average_rating: audiobook.average_rating,
//     });
//   } catch (error) {
//     console.error("Error adding rating:", error);
//     return next(error);
//   }
// };

export {
  createUser,
  verifyEmail,
  loginUser,
  generateSpotifyRefreshToken,
  getUserProfile,
  updateUserProfile,
  updatePreferredLanguage,
  updatePassword,
  forgotPassword,
  resetPassword,
  saveSpotifyStory,
  removeSpotifyStory,
  getSpotifyStories,
  getDevice,
  resendVerificationCode,
  verifyCode,
  sendPasswordVerificationCode,
  resetPasswordFromMobile,
};
