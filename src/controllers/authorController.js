import Author from "../models/authorModel.js"; // Assuming this is your Author model
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  sendEmailVerificationLink,
  sendPasswordResetLink,
} from "../utils/utils.js";

// Utility function for JWT verification (can be a separate middleware)
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403); // Forbidden
  }
}

// create a new author
const createAuthor = async (req, res, next) => {
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
  try {
    if (!first_name || !last_name || !email || !password) {
      const err = new Error(
        "Firstname, Lastname, Email and Password is required"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Check for valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error("Invalid email address");
      res.status(400);
      return next(err);
    }

    // Check for existing user
    const authorExists = await Author.findOne({ email });
    if (authorExists) {
      res.status(409);
      const err = new Error(
        "Author with this email already exists. Please use a different email address"
      );
      err.statusCode = 409;
      return next(err);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Send verification email
    const verificationEmailResponse = await sendEmailVerificationLink(
      email,
      token,
      first_name,
      "authors"
    );

    // Handle email sending error
    if (verificationEmailResponse.error) {
      const err = new Error(
        "Failed to send verification email, please try again later"
      );
      err.statusCode = 500;
      return next(err);
    }

    // Save user to DB
    await Author.create({
      avatar: randomAvatar,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      verify_token: token,
      verify_token_expires: Date.now() + 7200000, // 2 hours
    });

    // Respond with success message
    res.status(201).json({
      message:
        "Registered successfully. Please check your email to verify the account",
    });
  } catch (error) {
    return next(error);
  }
};

const verifyAuthorEmail = async (req, res, next) => {
  try {
    const author = await Author.findOne({
      verify_token: req.params.verifyToken,
    });

    // Check if the request expects JSON (like from Postman or API calls)
    const wantsJson =
      req.headers.accept && req.headers.accept.includes("application/json");

    if (!author) {
      const response = {
        success: false,
        message: "Invalid verification token.",
      };

      return wantsJson
        ? res.status(400).json(response)
        : res.render("email_verified", response);
    }

    if (author.verify_token_expires <= Date.now()) {
      if (!author.verified) {
        await author.deleteOne();
      }
      const response = {
        success: false,
        message: "Verification token has expired.",
      };

      return wantsJson
        ? res.status(400).json(response)
        : res.render("email_verified", response);
    }

    if (author.verified) {
      const response = {
        success: true,
        message: "Email already verified. Please login to continue.",
        isAuthor: true,
      };

      return wantsJson
        ? res.status(200).json(response)
        : res.render("email_verified", response);
    }

    // Verify the author
    author.verified = true;
    author.isAuthor = true;
    author.verify_token = undefined;
    author.verify_token_expires = undefined;
    await author.save();

    const response = {
      success: true,
      message: "Email verified successfully. Please login to continue.",
      isAuthor: true,
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

// const loginAuthor = async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     const err = new Error("Email & Password are required");
//     err.statusCode = 400;
//     return next(err);
//   }
//   // check for valid email adress
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     res.status(400);
//     const err = new Error("Invalid email address");
//     return next(err);
//   }
//   try {
//     const author = await Author.findOne({ email });
//     if (!author) {
//       const err = new Error("Author not found");
//       err.statusCode = 400;
//       return next(err);
//     }
//     if (!author.verified) {
//       const err = new Error(
//         "Your account verification is pending. Please verify your email to continue"
//       );
//       err.statusCode = 409;
//       return next(err);
//     }

//     // check for password match
//     const passwordMatched = await bcrypt.compare(password, author.password);

//     if (!passwordMatched) {
//       const err = new Error("Invalid email or password");
//       err.statusCode = 400;
//       return next(err);
//     }

//     // generate the token
//     const token = jwt.sign(
//       {
//         authorId: author._id, // Include authorId in the payload
//         email: email, // Use the email variable from the request
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: 2592000,
//       }
//     );
//     author.token = token;
//     await author.save();

//     // our token exp time
//     const expiresIn = 2592000;
//     res.status(200).json({
//       token,
//       avatar: author.avatar, // Include the avatar URL in the response
//       expiresIn,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
const loginAuthor = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const author = await Author.findOne({ email });
    if (!author) {
      const err = new Error("Author not found");
      err.statusCode = 400;
      return next(err);
    }
    if (!author.verified) {
      const err = new Error(
        "Your account verification is pending. Please verify your email to continue"
      );
      err.statusCode = 409;
      return next(err);
    }

    // check for password match
    const passwordMatched = await bcrypt.compare(password, author.password);

    if (!passwordMatched) {
      const err = new Error("Invalid email or password");
      err.statusCode = 400;
      return next(err);
    }

    // generate the token
    const token = jwt.sign(
      {
        authorId: author._id, // Include authorId in the payload
        email: email, // Use the email variable from the request
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 2592000,
      }
    );
    author.token = token;
    await author.save();

    // our token exp time
    const expiresIn = 2592000;

    // Include all relevant Author data in the response
    res.status(200).json({
      token,
      _id: author._id,
      email: author.email,
      first_name: author.first_name,
      last_name: author.last_name,
      avatar: author.avatar,
      isAuthor: author.isAuthor, // <----- ADD isAuthor
      expiresIn,
    });
  } catch (error) {
    return next(error);
  }
};
// get author list
// const getAuthors = async (req, res, next) => {
//   try {
//     // Check the JWT token
//     jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
//       if (err) {
//         res.sendStatus(403); // Send a 403 Forbidden status if JWT verification fails
//       } else {
//         // If JWT is valid, proceed to fetch the authors
//         const authors = await Author.find({}).select(
//           "avatar first_name last_name email"
//         ); // Select the columns you want

//         // Check if any authors were found
//         if (!authors || authors.length === 0) {
//           return res
//             .status(404)
//             .json({ message: "No authors found", status: 404 });
//         }

//         res.status(200).json(authors); // Send the authors data as a JSON response
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching authors:", error);
//     res.status(500).json({
//       message: "Error fetching authors",
//       error: error.message,
//       status: 500,
//     }); // Send an error response
//   }
// };
const getAuthors = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]; // Correct header name
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.sendStatus(401); // Unauthorized if no token
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        console.error("JWT verification error:", err); // Log the error
        return res.sendStatus(403); // Forbidden if JWT verification fails
      } else {
        // Token is valid
        const authorId = req.query.authorId; // You still use authorId here.  Why?
        console.log("authData:", authData); // Log the decoded token data
        console.log(authorId);

        const authors = await Author.find({ isAuthor: true }).select(
          "avatar first_name last_name email"
        );

        if (!authors) {
          return res
            .status(404)
            .json({ message: "No authors found", status: 404 });
        }

        res.status(200).json(authors);
      }
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).json({
      message: "Error fetching authors",
      error: error.message,
      status: 500,
    });
  }
};

// get author  profile
const getAuthorProfile = async (req, res, next) => {
  try {
    const author = await Author.findById(req.author._id);

    if (!author) {
      const err = new Error("author not found");
      err.statusCode = 404;
      return next(err);
    }

    const profileData = {
      _id: author._id,
      first_name: author.first_name,
      last_name: author.last_name,
      email: author.email,
    };

    res.status(200).json({ profileData });
  } catch (error) {
    return next(error);
  }
};

// update author profile
// const updateAuthorProfile = async (req, res, next) => {
//   const { first_name, last_name, email } = req.body;
//   try {
//     const author = await Author.findById(req.author._id);
//     if (!author) {
//       const err = new Error("author not found");
//       err.statusCode = 404;
//       return next(err);
//     }

//     if (first_name || last_name) {
//       author.first_name = first_name || author.first_name;
//       author.last_name = last_name || author.last_name;
//     }

//     if (email && email !== author.email) {
//       const authorExists = await Author.findOne({ email });

//       if (authorExists) {
//         const err = new Error(
//           `${email} is already in use, please choose a different one`
//         );
//         err.statusCode = 409;
//         return next(err);
//       }
//       author.email = email;
//     }
//     await author.save();
//     res.status(200).json({ message: "updated successfully" });
//   } catch (error) {
//     return next(error);
//   }
// };

// update author profile
const updateAuthorProfile = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  try {
    const author = await Author.findById(req.author._id);
    if (!author) {
      const err = new Error("author not found");
      err.statusCode = 404;
      return next(err);
    }

    if (first_name || last_name) {
      author.first_name = first_name || author.first_name;
      author.last_name = last_name || author.last_name;
    }

    if (email && email !== author.email) {
      console.log("Inside email update block:");
      console.log("req.body.email:", req.body.email);
      console.log("author.email:", author.email);
      // Modified email existence check:  Exclude the current author's ID
      const authorExists = await Author.findOne({
        email: req.body.email,
        _id: { $ne: req.author._id }, // Exclude the current author's ID
      });

      console.log("authorExists:", authorExists);

      if (authorExists) {
        const err = new Error(
          `${email} is already in use, please choose a different one`
        );
        err.statusCode = 409;
        return next(err);
      }
      author.email = email;
    }
    await author.save();
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    return next(error);
  }
};
// update author password
const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const author = await Author.findById(req.author._id);
    if (!author) {
      const err = new Error("author not found");
      err.statusCode = 404;
      return next(err);
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    author.password = hashedPassword;
    await author.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

// forgot password
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    return next(err);
  }
  try {
    const author = await Author.findOne({ email });
    if (!author) {
      const err = new Error("Email not found");
      err.statusCode = 400;
      return next(err);
    }
    // generate token
    const token = jwt.sign(
      { authorId: author._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save token in DB
    author.reset_password_token = token;
    author.reset_password_expires = Date.now() + 7200000;
    await author.save();
    // send mail
    const verificationEmailResponse = await sendPasswordResetLink(
      email,
      token,
      author.first_name
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

// reset password
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
    // Find the author by token and check if the reset token has expired
    const author = await Author.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }, // Check if token is still valid
    });

    // Log the token, current time, and token expiry for debugging
    console.log("Reset Token:", token); // Log the reset token
    console.log("Current Time:", Date.now()); // Log the current time
    console.log("Token Expiry:", user?.reset_password_expires); // Log the token expiry date

    if (!author) {
      console.log("author not found or token expired");

      const err = new Error(
        "Password reset link is invalid or expired, please try again"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the reset token and expiry
    author.password = hashedPassword;
    author.reset_password_token = undefined;
    author.reset_password_expires = undefined;

    // Save the updated user object
    await author.save();

    res.status(200).json({
      message: "Password updated successfully, please login to continue",
    });
  } catch (error) {
    return next(error); // Pass any errors to the error-handling middleware
  }
};

export {
  getAuthors,
  createAuthor,
  verifyAuthorEmail,
  loginAuthor,
  getAuthorProfile,
  updateAuthorProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
};
