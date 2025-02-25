// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./src/config/db.js";
// import { errHandler, notFound } from "./src/middlewares/errMiddleware.js";
// import languageRoute from "./src/routes/languageRoute.js";
// import categoryRoute from "./src/routes/categoryRoute.js";
// import userRoute from "./src/routes/userRoute.js";
// import cors from "cors";
// import useragent from "express-useragent";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// import authorRoute from "./src/routes/authorRoute.js";
// import audiobookRoute from "./src/routes/audiobookRoute.js";
// import compression from "compression";
// // Load environment variables
// dotenv.config();
// const port = process.env.PORT || 4000;

// // Connect to the database
// await connectDB();

// // Initialize Express app
// const app = express();

// // Middleware
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production" ? "http://localhost:4000" : "*", // Restrict origins in production
//   })
// );
// app.use(useragent.express());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(compression());

// // Routes
// app.get("/", (req, res) => {
//   res.send("Hello, World!");
// });
// app.use("/api/languages", languageRoute);
// app.use("/api/categories", categoryRoute);
// app.use("/api/users", userRoute);
// app.use("/api/authors", authorRoute);
// app.use("/api/audiobooks", audiobookRoute);

// // Test route to trigger error
// app.get("/test", (req, res, next) => {
//   const err = new Error("Something went wrong");
//   next(err);
// });

// // Fix for ES modules __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.set("view engine", "ejs");

// // Explicitly set the views directory to your templates folder
// app.set("views", path.join(__dirname, "src/templates"));

// console.log("Views Path:", path.join(__dirname, "src/templates"));

// // Debugging for development (Make sure to remove or disable this in production)
// if (process.env.NODE_ENV === "development") {
//   app.get("/debug-paths", (req, res) => {
//     const debug = {
//       viewsPath,
//       viewsExists: fs.existsSync(viewsPath),
//       cwd: process.cwd(),
//       dirname: __dirname,
//       viewsContents: fs.existsSync(viewsPath)
//         ? fs.readdirSync(viewsPath)
//         : "Directory not found",
//       env: process.env.NODE_ENV,
//     };
//     res.json(debug);
//   });
// }

// // Error handling middleware
// app.use(notFound);
// app.use(errHandler);
// // app.use(
// //   cors({
// //     origin: "http://localhost:4000", // Replace with the frontend's origin
// //     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
// //     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
// //   })
// // );
// // app.js
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production" ? "http://localhost:4000" : "*", // Restrict origins in production
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//   })
// );

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port http://localhost:${port}`);
// });
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import { errHandler, notFound } from "./src/middlewares/errMiddleware.js";
import languageRoute from "./src/routes/languageRoute.js";
import categoryRoute from "./src/routes/categoryRoute.js";
import userRoute from "./src/routes/userRoute.js";
import cors from "cors";
import useragent from "express-useragent";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import authorRoute from "./src/routes/authorRoute.js";
import audiobookRoute from "./src/routes/audiobookRoute.js";
import compression from "compression";

// Load environment variables
dotenv.config();
const port = process.env.PORT || 4000;

// Connect to the database
await connectDB();

// Initialize Express app
const app = express();

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:4000", // Development frontend
      "http://localhost:5173", // Vite's default development port
      "https://audiblebooks-frontend.onrender.com", // Production frontend
    ];

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/api/languages", languageRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/users", userRoute);
app.use("/api/authors", authorRoute);
app.use("/api/audiobooks", audiobookRoute);

// Error handling middleware
app.use(notFound);
app.use(errHandler);
// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");

// Explicitly set the views directory to your templates folder
app.set("views", path.join(__dirname, "src/templates"));

// Debugging for development (Make sure to remove or disable this in production)
if (process.env.NODE_ENV === "development") {
  app.get("/debug-paths", (req, res) => {
    const viewsPath = path.join(__dirname, "src/templates");
    const debug = {
      viewsPath,
      viewsExists: fs.existsSync(viewsPath),
      cwd: process.cwd(),
      dirname: __dirname,
      viewsContents: fs.existsSync(viewsPath)
        ? fs.readdirSync(viewsPath)
        : "Directory not found",
      env: process.env.NODE_ENV,
    };
    res.json(debug);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
