// audioOptimizationMiddleware.js
import { exec } from "child_process"; // For running FFmpeg commands
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const optimizeAudio = async (req, res, next) => {
  try {
    if (!req.files || !req.files["audiobook"] || !req.files["audiobook"][0]) {
      console.log("No audio to process, moving to next middleware.");
      return next(); // No audio to process, move to next middleware/controller
    }

    const audiobookFile = req.files["audiobook"][0];
    const originalFilename = audiobookFile.originalname;
    const inputFilePath = path.join(__dirname, "temp", originalFilename); // Temporary input file
    const outputFilename = `optimized-${originalFilename}.mp3`; // Example output filename
    const outputFilePath = path.join(__dirname, "temp", outputFilename); // Temporary output file

    // Create the temp directory if it doesn't exist
    try {
      await fs.mkdir(path.join(__dirname, "temp"), { recursive: true });
    } catch (err) {
      console.error("Error creating temp directory:", err);
      return res.status(500).send("Error creating temp directory.");
    }

    // 1. Save the uploaded audio file to a temporary location
    await fs.writeFile(inputFilePath, audiobookFile.buffer);
    console.log("file written");

    // 2. FFmpeg command for optimization (adjust as needed)
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -vn -acodec libmp3lame -ab 128k -ar 44100 -ac 1 "${outputFilePath}"`;

    // 3. Execute FFmpeg command
    console.log(`Executing FFmpeg command: ${ffmpegCommand}`);
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`FFmpeg error: ${error}`);
        console.error(`FFmpeg stderr: ${stderr}`);
        // Clean up temporary input file
        fs.unlink(inputFilePath, (err) => {
          // Use callback-based fs.unlink for compatibility
          if (err) {
            console.error("Error deleting temp input file:", err);
          }
        });
        return res.status(500).send("Error optimizing audio.");
      }

      console.log(`FFmpeg stdout: ${stdout}`);

      // 4. Read the optimized audio file back into a buffer
      fs.readFile(outputFilePath, (err, optimizedAudioBuffer) => {
        // Use callback-based fs.readFile
        if (err) {
          console.error("Error reading optimized audio file:", err);
          // Clean up temporary files
          fs.unlink(inputFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting temp input file:", unlinkErr);
            }
          });
          fs.unlink(outputFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting temp output file:", unlinkErr);
            }
          });
          return res.status(500).send("Error reading optimized audio file.");
        }
        // 5. Store the optimized audio data or URL in your database (depending on your storage strategy)
        req.optimizedAudio = {
          filename: outputFilename,
          buffer: optimizedAudioBuffer,
          contentType: "audio/mpeg", //Or use the req.file.mimetype
        };
        // Clean up temporary files
        fs.unlink(inputFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting temp input file:", unlinkErr);
          }
        });
        fs.unlink(outputFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting temp output file:", unlinkErr);
          }
        });

        console.log("Moving to next middleware");
        next(); // Move to next middleware
      });
    });
  } catch (error) {
    console.error("Error in audioOptimizationMiddleware:", error);
    res.status(500).send("Error optimizing audio.");
  }
};

export default optimizeAudio;
