import express from "express";
import { summarizeFile } from "../controllers/aiController.js";
const router = express.Router();

router.post("/summarize", summarizeFile);

export default router;
