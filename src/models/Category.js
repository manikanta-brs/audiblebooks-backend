// models/Category.js
import mongoose from "mongoose";

let Category; // Declare Category outside the if block

if (mongoose.models.Category) {
  Category = mongoose.model("Category");
} else {
  const categorySchema = mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
      },
      keywords: {
        type: [String],
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      imageUrl: {
        type: String,
        required: false,
      },
    },
    {
      timestamps: true,
    }
  );
  Category = mongoose.model("Category", categorySchema);
}

export default Category;
