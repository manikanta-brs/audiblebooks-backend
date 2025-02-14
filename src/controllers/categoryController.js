import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";

// create a sample category array
const categories = [
  { name: "Fiction" },
  { name: "Non-Fiction" },
  { name: "Biographies" },
  { name: "Mystery" },
  { name: "Adventure" },
  { name: "Thriller" },
];

const getCategories = asyncHandler(async (req, res) => {
  // const categories = await Category.find();

  if (!categories.length) {
    return res.status(404).json({
      success: false,
      message: "No categories found",
    });
  }

  res.status(200).json({
    success: true,
    data: categories,
  });
});

export { getCategories };
