import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { search } from "./controller/handle";

dotenv.config();

const app = express();
app.use(cors());

// Define the route handler with explicit types
app.get("/search", search as any);
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});