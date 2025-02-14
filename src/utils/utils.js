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

// Send password reset link

// const sendEmailVerificationLink = async (email, token, name) => {
//   try {
//     const { token } = useParams(); // Extract token from URL

//     const renderedContent = await ejs.renderFile(
//       path.join(currentDirectory, "/../templates/confirmEmail.ejs"),
//       { token, name }
//     );
//     const mailOptions = {
//       from: "manikantadon675@gmail.com",
//       to: email,
//       subject: "Email Verification",
//       html: renderedContent,
//     };
//     const verificationInfo = await mail.sendMail(mailOptions);
//     return verificationInfo;
//   } catch (error) {
//     console.error("Error sending email verification:", error);
//     return error;
//   }
// };
const sendPasswordResetLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      path.join(currentDirectory, "/../templates/reset_password.ejs"),
      { token, name }
    );
    const mailOptions = {
      from: "manikantadon675@gmail.com",
      to: email,
      subject: "StoryTime : Password Reset",
      html: renderedContent,
    };
    const resetInfo = await mail.sendMail(mailOptions);
    return resetInfo;
  } catch (error) {
    console.error("Error sending password reset:", error);
    return error;
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
