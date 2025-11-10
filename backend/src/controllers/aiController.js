import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();
const require = createRequire(import.meta.url);
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ---------- PDF Text Extraction ----------
async function extractPDFText(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();
      pdfParser.loadPDF(filePath);

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n\n");
        resolve(text);
      });

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(errData.parserError);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// ---------- Text Extraction ----------
async function extractText(filePath) {
  if (!filePath) return ""; // ✅ Prevent crash if no path given

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return await extractPDFText(filePath);
  if ([".txt", ".md", ".js", ".py", ".java", ".cpp", ".html", ".css", ".json"].includes(ext)) {
    return fs.readFileSync(filePath, "utf8");
  }
  console.warn(`⚠️ Unsupported file type: ${ext}`);
  return "";
}

// ---------- AI Summarization ----------
export const summarizeFile = async (req, res) => {
  try {
    const { fileName, content, filePath } = req.body;

    let text = "";
    if (content && typeof content === "string" && content.trim().length > 0) {
      text = content;
    } else if (filePath) {
      text = await extractText(filePath);
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ msg: "No readable text for summarization." });
    }

    console.log("🧠 Summarizing file:", fileName, "Text length:", text.length);

    // Call Gemini
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `
You are a concise AI file summarizer.
Summarize this content in 2–3 sentences, list 3 relevant tags, guess document type and tone.

Return strict JSON:
{
  "summary": "...",
  "tags": ["...", "...", "..."],
  "docType": "...",
  "tone": "..."
}

Filename: ${fileName}
---
${text.slice(0, 5000)}
        `,
        },
      ],
    });

    const resultText = response.text;
    console.log("🧠 Gemini raw output:", resultText);

    let summary = {};
    try {
      summary = JSON.parse(resultText);
    } catch {
      summary = {
        summary: resultText,
        tags: [],
        docType: "unknown",
        tone: "neutral",
      };
    }

    return res.json({ ok: true, summary });
  } catch (err) {
    console.error("❌ Gemini summarization error:", err);
    return res.status(500).json({ msg: "Summarization failed", error: err.message });
  }
};