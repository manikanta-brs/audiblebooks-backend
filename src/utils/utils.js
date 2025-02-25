import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const currentFilePath = import.meta.url;
const currentDirectory = path.dirname(fileURLToPath(currentFilePath));

const mail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "manikantadon675@gmail.com",
    pass: process.env.MAIL_PASS_KEY, // Use environment variable
  },
});

/*Send email verification link*/
const sendEmailVerificationLink = async (email, token, name, role) => {
  try {
    const renderedContent = await ejs.renderFile(
      path.join(currentDirectory, "/../templates/confirmEmail.ejs"),
      { token, name, role }
    );
    console.log("Generated Token:", token);
    console.log("Role:", role);

    const mailOptions = {
      from: "manikantadon675@gmail.com",
      to: email,
      subject: "Email Verification",
      html: renderedContent,
    };
    const verificationInfo = await mail.sendMail(mailOptions);
    console.log("Sending email to:", email);
    console.log("SMTP Config:", mail.transporter.options);

    return verificationInfo;
  } catch (error) {
    return { error: error.message };
  }
};

// const sendPasswordResetLink = async (email, token, name, role) => {
//   try {
//     const renderedContent = await ejs.renderFile(
//       path.join(currentDirectory, "/../templates/reset_password.ejs"),
//       { token, name, role } // Added role to template data
//     );

//     console.log("Generated Token:", token);
//     console.log("Role:", role); // Log the role
//     console.log("Sending password reset email to:", email);
//     console.log("SMTP Config:", mail.transporter.options);

//     const mailOptions = {
//       from: "manikantadon675@gmail.com",
//       to: email,
//       subject: "AudibleBooks: Password Reset",
//       html: renderedContent,
//     };

//     const resetInfo = await mail.sendMail(mailOptions);

//     console.log("Password reset email sent successfully.");

//     return resetInfo;
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     return { error: error.message };
//   }
// };
// sendPasswordResetLink function
const sendPasswordResetLink = async (email, token, name, entityType) => {
  let resetLink = `https://audiblebooks-frontend.onrender.com/resetpassword/${token}`; // Default
  console.log("Entity type is", entityType);
  if (entityType === "users") {
    resetLink = `https://audiblebooks-frontend.onrender.com/resetuserpassword/${token}`;
  } else if (entityType === "authors") {
    resetLink = `https://audiblebooks-frontend.onrender.com/resetauthorpassword/${token}`;
  }
  console.log("The reset link is ", resetLink);

  try {
    const templatePath = path.join(
      currentDirectory,
      "/../templates/reset_password.ejs"
    );

    const renderedHTML = await ejs.renderFile(templatePath, {
      name: name,
      resetLink: resetLink,
      token: token,
      entityType: entityType, // Pass entityType for template customization
    });

    const mailOptions = {
      from: "manikantadon675@gmail.com", // Consider using process.env.EMAIL_FROM
      to: email,
      subject: "Password Reset Request",
      html: renderedHTML,
    };

    const resetInfo = await mail.sendMail(mailOptions); // Use your existing mail transport

    return resetInfo;
  } catch (error) {
    console.error("EJS rendering error:", error); // More specific logging
    return { error: error.message };
  }
};

const sendPasswordResetVerificationCode = async (name, email, otp) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/reset_password_code.ejs`,
      { name, otp }
    );

    const mailOptions = {
      from: "manikantadon675@gmail.com",
      to: email,
      subject: "Storytime - Password reset code",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};
const sendVerificationCode = async (name, email, otp) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/otp.ejs`,
      { name, otp }
    );

    const mailOptions = {
      from: " manikantadon675@gmail.com ",
      to: email,
      subject: "Storytime - Email Confirmation",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    return verificationInfo;
  } catch (error) {
    return { error };
  }
};
export {
  sendEmailVerificationLink,
  sendPasswordResetLink,
  sendPasswordResetVerificationCode,
  sendVerificationCode,
};
