// import { verify } from "jsonwebtoken";
import mongoose from "mongoose";

// const authorSchema = mongoose.Schema(
//   {
//     first_name: { type: String, default: null },
//     last_name: { type: String, default: null },
//     email: { type: String, unique: true },
//     password: { type: String },
//     categories: { type: Array },
//     saved_books: { type: Array },
//     cover_images: { type: Array },
//     audio_files: { type: Array },
//     description: { type: String },
//     bio: { type: String },

//     token: { type: String },
//     verified: { type: Boolean, default: false },
//     verify_token: { type: String },
//     verify_token_expires: Date,
//     reset_password_token: { type: String },
//     reset_password_expires: Date,
//     status: { type: Boolean, default: true },
//     isAdmin: { type: Boolean, default: false },
//     isAuthor: { type: Boolean, default: true },
//   },
//   {
//     timestamps: {
//       createdAt: "created_at", // Fix typo: `createAt` -> `createdAt`
//       updatedAt: "updated_at", // Fix typo: `updateAt` -> `updatedAt`
//     },
//   }
// );

const authorSchema = mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1326/1326405.png",
    }, // Add this line
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    categories: { type: Array },
    saved_books: { type: Array },
    cover_images: { type: Array },
    audio_files: { type: Array },
    description: { type: String },
    bio: { type: String },
    token: { type: String },
    verified: { type: Boolean, default: false },
    verify_token: { type: String },
    verify_token_expires: Date,
    reset_password_token: { type: String },
    reset_password_expires: Date,
    status: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isAuthor: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
const Author = mongoose.model("Author", authorSchema);

export default Author;
