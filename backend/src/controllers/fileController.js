// src/controllers/fileController.js
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const filesJson = path.resolve("src/data/files.json");
const filesDir = path.resolve("src/data/files");

// ---------- Helpers ----------
function readFiles() {
  if (!fs.existsSync(filesJson)) return [];
  return JSON.parse(fs.readFileSync(filesJson, "utf8") || "[]");
}

function saveFiles(files) {
  fs.writeFileSync(filesJson, JSON.stringify(files, null, 2));
}

// ✅ Extract text from PDFs via pdf2json
async function extractPDFText(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n\n");
        resolve(text);
      } catch (e) {
        reject(e);
      }
    });
    pdfParser.loadPDF(filePath);
  });
}

// ✅ Extract text depending on extension
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // PDFs
    if (ext === ".pdf") {
      console.log("📄 Extracting PDF text:", filePath);
      const text = await extractPDFText(filePath);
      console.log("✅ Extracted PDF text length:", text.length);
      return text;
    }

    // Text/code formats
    if ([".txt", ".md", ".js", ".py", ".java", ".cpp", ".html", ".css", ".json"].includes(ext)) {
      const text = fs.readFileSync(filePath, "utf8");
      console.log("✅ Extracted text file length:", text.length);
      return text;
    }

    console.warn("⚠️ Unsupported file type:", ext);
    return "";
  } catch (err) {
    console.error("❌ Text extraction failed:", err.message);
    return "";
  }
}

// ---------- DELETE ----------
export const deleteFile = (req, res) => {
  try {
    const { id } = req.params;
    const files = readFiles();
    const index = files.findIndex((f) => f.id === id);
    if (index === -1) return res.status(404).json({ ok: false, error: "File not found" });

    const filePath = path.join(filesDir, files[index].storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    files.splice(index, 1);
    saveFiles(files);
    res.json({ ok: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// ---------- UPLOAD + AI SUMMARIZATION ----------
export const uploadFile = async (req, res) => {
  try {
    const { originalname } = req.file;
    const { wrappedCEK, iv, fileIv, userEmail, compression, summary } = req.body; // ✅ added summary from frontend

    const id = uuidv4();
    const filenameOnDisk = `${id}.enc`;
    const destPath = path.join(filesDir, filenameOnDisk);

    // Move temp file into our secure storage directory
    fs.renameSync(req.file.path, destPath);

    // ✅ Initialize file record
    const record = {
      id,
      owner: userEmail,
      originalName: originalname,
      storedName: filenameOnDisk,
      wrappedCEK,
      iv,
      fileIv,
      compression,
      createdAt: new Date().toISOString(),
      summary: "",
      tags: [],
      docType: "",
      tone: "",
    };

    // ✅ Parse summary if present (from client-side AI)
    if (summary) {
      try {
        const parsed = JSON.parse(summary);
        record.summary = parsed.summary || "";
        record.tags = parsed.tags || [];
        record.docType = parsed.docType || "";
        record.tone = parsed.tone || "";
        console.log("🧠 Received AI summary from client:", parsed);
      } catch (err) {
        console.warn("⚠️ Summary parsing failed, saving raw text.");
        record.summary = summary;
      }
    } else {
      console.warn("⚠️ No AI summary metadata provided — skipping summarization.");
    }

    // ✅ Save metadata to JSON
    const files = readFiles();
    files.push(record);
    saveFiles(files);

    // ✅ Return success
    res.json({
      ok: true,
      id,
      summary: record.summary,
      tags: record.tags,
      docType: record.docType,
      tone: record.tone,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
};


// ---------- LIST ----------
export const listFiles = (req, res) => {
  const files = readFiles();
  res.json(files);
};

// ---------- DOWNLOAD ----------
export const downloadFile = (req, res) => {
  const { id } = req.params;
  const files = readFiles();
  const rec = files.find((f) => f.id === id);
  if (!rec) return res.status(404).json({ msg: "Not found" });

  const filePath = path.join(filesDir, rec.storedName);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ msg: "File missing" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${rec.originalName}.enc"`
  );
  res.sendFile(filePath);
};
