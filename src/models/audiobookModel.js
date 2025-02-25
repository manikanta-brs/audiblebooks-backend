// import mongoose from "mongoose";

// const audiobookSchema = mongoose.Schema(
//   {
//     categories: [{ type: String, required: true }], // Multiple categories
//     subcategories: [{ type: String }], // Multiple subcategories
//     authorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "Author",
//     },
//     authorName: { type: String, required: true },
//     title: { type: String, required: true },
//     coverImage: { type: String, required: true },
//     audioFile: { type: String, required: true },
//     uploadedAt: { type: Date, default: Date.now },
//     description: { type: String },
//     genre: { type: String },
//     ratings: [
//       {
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         rating: Number,
//         review: String,
//         ratingSource: String,
//         ratingDate: Date,
//       },
//     ],
//     total_ratings: { type: Number, default: 0 },
//     total_count: { type: Number, default: 0 },
//     average_rating: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// audiobookSchema.methods.calculateAverageRating = function () {
//   if (this.ratings.length === 0) return 0;

//   const total = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
//   this.average_rating = total / this.ratings.length;
//   this.total_count = this.ratings.length;
//   this.total_ratings = total;

//   return this.save();
// };

// const Audiobook = mongoose.model("Audiobook", audiobookSchema);
// export default Audiobook;

import mongoose from "mongoose";

const audiobookSchema = mongoose.Schema(
  {
    categories: [{ type: String, required: true }],
    subcategories: [{ type: String }],
    // authorId: { type: String, required: true }, // Changed to String
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Author",
    },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    coverImage: { type: String, required: true },
    audioFile: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String },
    genre: { type: String },
    ratings: [
      {
        userId: { type: String, required: true }, // Can be User or Author ID (stored as String)
        rating: { type: Number, required: true, min: 0, max: 5 },
        review: { type: String, default: "" }, // Optional review
      },
    ],
    total_ratings: { type: Number, default: 0 },
    total_count: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Method to calculate the average rating
audiobookSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.average_rating = 0;
    this.total_count = 0;
    this.total_ratings = 0;
    return this.save();
  }

  const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.average_rating = total / this.ratings.length;
  this.total_count = this.ratings.length;
  this.total_ratings = total;

  return this.save();
};

const Audiobook = mongoose.model("Audiobook", audiobookSchema);
export default Audiobook;
