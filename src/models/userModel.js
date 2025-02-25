// import { verify } from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1326/1326405.png",
    }, // Fix typo: `avathar` -> `avatar`
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    languages: { type: Array, default: [] },
    categories: { type: Array },
    saved_books: { type: Array },
    token: { type: String },
    verified: { type: Boolean, default: false },
    verify_token: { type: String },
    verify_token_expires: Date,
    reset_password_token: { type: String },
    reset_password_expires: Date,
    status: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isAuthor: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
