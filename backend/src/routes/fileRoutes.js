import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: "/tmp",
  filename: (req, file, cb) => {
    const id = uuidv4();
    cb(null, `${id}.enc`);
  },
});
const upload = multer({ storage });


router.post("/upload", upload.single("file"), uploadFile);
router.get("/list", listFiles);
router.get("/download/:id", downloadFile);
router.delete("/delete/:id", deleteFile);

export default router;
