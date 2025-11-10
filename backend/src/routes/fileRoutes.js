import express from "express";
import multer from "multer";
import {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/list", listFiles);
router.get("/download/:id", downloadFile);
router.delete("/delete/:id", deleteFile);

export default router;
