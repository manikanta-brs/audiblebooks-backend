import mongoose from "mongoose";
import multer from "multer";
import { GridFSBucket } from "mongodb";

// MongoDB Connection
const conn = mongoose.connection;

let gridfsBucket;

// Initialize GridFSBucket
const initializeGridFSBucket = () => {
  if (conn.readyState === 1) {
    // Check if connected
    gridfsBucket = new GridFSBucket(conn.db, {
      bucketName: "uploads",
      chunkSizeBytes: 1048576, // Set chunk size to 1MB
    });
    console.log("✅ GridFSBucket initialized");
  } else {
    console.log("MongoDB is not connected. Retrying in 1 second...");
    setTimeout(initializeGridFSBucket, 1000); // Retry after 1 second
  }
};

// Wait for the connection to open and initialize GridFSBucket
conn.once("open", () => {
  initializeGridFSBucket();
});

conn.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// Getter function to safely retrieve gridfsBucket
const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error("GridFSBucket is not initialized yet.");
  }
  return gridfsBucket;
};

// Set up Multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // Max file size of 100MB
}).fields([
  { name: "audiobook", maxCount: 1 }, // Audiobook field
  { name: "image", maxCount: 1 }, // Image field
]);

export { getGridFSBucket, upload };
