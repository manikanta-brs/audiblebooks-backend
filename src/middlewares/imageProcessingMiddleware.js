// imageProcessingMiddleware.js
import sharp from "sharp";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processImage = async (req, res, next) => {
  try {
    if (!req.files || !req.files["image"] || !req.files["image"][0]) {
      console.log("No image to process, moving to next middleware.");
      return next(); // No image to process, move to next middleware/controller
    }

    const imageFile = req.files["image"][0];
    const imageBuffer = imageFile.buffer;
    const originalFilename = imageFile.originalname;
    const uploadDir = path.join(__dirname, "uploads"); //__dirname is current directory

    // Create the upload directory if it doesn't exist
    try {
      console.log("Creating upload directory:", uploadDir);
      await fs.mkdir(uploadDir, { recursive: true });
      console.log("Upload directory created successfully.");
    } catch (err) {
      console.error("Error creating upload directory:", err);
      return res.status(500).send("Error creating upload directory.");
    }

    const timestamp = Date.now();
    const filename = `original-${timestamp}-${originalFilename}`;
    const thumbnailFilename = `thumbnail-${timestamp}-${originalFilename}`;

    const originalFilePath = path.join(uploadDir, filename);
    const thumbnailFilePath = path.join(uploadDir, thumbnailFilename);

    try {
      // 1. Sharp for Resizing and Format Conversion (WebP if possible):
      console.log("Starting Sharp processing...");
      let sharpImage = sharp(imageBuffer);
      console.log("Sharp image loaded.");
      // Resize the image to create a thumbnail (200x200)
      console.log("Resizing image...");
      sharpImage = sharpImage.resize(200, 200);
      console.log("Image resized.");
      // Convert to WebP if possible, otherwise leave as original format
      if (req.accepts("image/webp")) {
        console.log("Converting to WebP...");
        sharpImage = sharpImage.webp({ quality: 80 }); // Adjust quality as needed
        console.log("Converted to WebP.");
      }

      console.log("Generating thumbnail buffer...");
      const thumbnailBuffer = await sharpImage.toBuffer(); // Get the buffer of the resized image
      console.log("Thumbnail buffer generated.");

      console.log("Starting Imagemin processing...");
      const optimizedThumbnailBuffer = await imagemin.buffer(thumbnailBuffer, {
        plugins: [
          imageminMozjpeg({ quality: 70 }), // JPEG compression
          imageminPngquant({ quality: [0.6, 0.8] }), // PNG compression
        ],
      });

      console.log("Imagemin processing complete.");
      // Save the original file
      console.log("Writing original file...");
      await fs.writeFile(originalFilePath, imageBuffer);
      console.log("Original file written.");
      //Rewrite the optimized file
      console.log("Writing optimized file...");
      await fs.writeFile(thumbnailFilePath, optimizedThumbnailBuffer);
      console.log("Optimized file written.");

      console.log(
        "Generating URLs for the saved images (adjust to your server setup)"
      );
      const originalImageUrl = `/uploads/${filename}`;
      const thumbnailImageUrl = `/uploads/${thumbnailFilename}`;
      console.log("originalImageUrl", originalImageUrl);
      console.log("thumbnailImageUrl", thumbnailImageUrl);
      req.processedImage = {
        originalFilename,
        thumbnailFilename,
        originalImageUrl,
        thumbnailImageUrl,
        thumbnailBuffer: optimizedThumbnailBuffer,
      };
      next();
    } catch (processingError) {
      console.error("Error within image processing:", processingError);
      return res.status(500).send("Error during image processing.");
    }
  } catch (error) {
    console.error("General error in processImage middleware:", error);
    res.status(500).send("General error during image processing.");
  }
};

export default processImage;
