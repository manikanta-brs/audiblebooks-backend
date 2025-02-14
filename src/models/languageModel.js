import mongoose from "mongoose";

const languageSchema = mongoose.Schema(
  {
    name: { type: String },
    code: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createAt: "created_at",
      updateAt: "updated_at",
    },
  }
);

const Language = mongoose.model("Language", languageSchema);

export default Language;
