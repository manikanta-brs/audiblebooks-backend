import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    subcategories: [{ type: String }], // Add an array for subcategories
    keywords: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
