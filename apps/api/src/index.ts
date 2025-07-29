import express, { type Request, type Response } from "express";
import { connectToDatabase } from "./lib/db";
import routes from "./routes";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

//CORS configuration allowing all origins
app.use((req: Request, res: Response, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Connect to database
connectToDatabase()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Tennis Dashboard API");
});

// API routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
