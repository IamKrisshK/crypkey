import React, { useState } from "react";
import api from "../utils/api";
import {
  compressFile,
  generateFileKey,
  encryptBlobWithKey,
  wrapCekWithUek,
} from "../crypto/encrypt";

export default function FileUploadCard({ user, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [aiSummary, setAiSummary] = useState(null);

  // 🧠 Step 1: Summarize plaintext before encryption
  const summarizeFile = async (plainText, fileName) => {
    try {
      setStatus("🧠 Summarizing file with AI...");
      const res = await api.post("/ai/summarize", {
        fileName,
        filePath: null,
        content: plainText,
      });
      if (res.data.summary) {
        setAiSummary(res.data.summary);
        console.log("✅ AI Summary:", res.data.summary);
        return res.data.summary;
      }
      return null;
    } catch (err) {
      console.error("AI summarization failed:", err);
      setStatus("⚠️ AI summarization skipped.");
      return null;
    }
  };

  // 🔐 Step 2: Encrypt + Upload
  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first.");

    try {
      const text = await file.text();
      const summary = await summarizeFile(text, file.name);

      setStatus("📦 Compressing file...");
      const compressed = await compressFile(file);

      setStatus("🔑 Generating encryption key...");
      const cek = await generateFileKey();

      setStatus("🔒 Encrypting file...");
      const { cipherBuffer, iv: fileIvBase64 } = await encryptBlobWithKey(compressed, cek);

      setStatus("🧠 Wrapping file key...");
      const uek = window.__UEK_KEY__;
      if (!uek) return alert("UEK not found in session. Please log in again.");

      const { wrappedBase64, ivBase64: wrapIvBase64 } = await wrapCekWithUek(cek, uek);

      // Prepare upload payload
      const form = new FormData();
      const blob = new Blob([cipherBuffer], { type: "application/octet-stream" });
      form.append("file", blob, file.name + ".enc");
      form.append("wrappedCEK", wrappedBase64);
      form.append("iv", wrapIvBase64);
      form.append("fileIv", fileIvBase64);
      form.append("userEmail", user.email);
      form.append("compression", "zip");

      if (summary) form.append("summary", JSON.stringify(summary));

      setStatus("☁️ Uploading securely...");
      const res = await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.ok) {
        setStatus("✅ File uploaded successfully!");
        setFile(null);
        setAiSummary(null);
        if (onUploadComplete) onUploadComplete();
      } else {
        setStatus("❌ Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("❌ Error during upload.");
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>📤 Upload & Encrypt File</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.input}
      />

      <button onClick={handleFileUpload} style={styles.uploadBtn}>
        Upload Securely
      </button>

      {aiSummary && (
        <div style={styles.summaryBox}>
          <h4 style={styles.summaryHeading}>🧠 AI Summary Preview</h4>
          <p><b>Summary:</b> {aiSummary.summary}</p>
          <p><b>Tags:</b> {aiSummary.tags?.join(", ")}</p>
          <p><b>Type:</b> {aiSummary.docType}</p>
          <p><b>Tone:</b> {aiSummary.tone}</p>
        </div>
      )}

      <div style={styles.status}>{status}</div>
    </div>
  );
}

// 💅 Hardcoded Light Theme Styles
const styles = {
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    marginBottom: "20px",
    maxWidth: "700px",
    margin: "20px auto",
    color: "#1e293b",
  },
  heading: {
    fontSize: "1.4rem",
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: "15px",
  },
  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "1rem",
    marginBottom: "15px",
    cursor: "pointer",
  },
  uploadBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
    transition: "all 0.3s ease",
  },
  summaryBox: {
    marginTop: "20px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "15px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    color: "#334155",
    fontSize: "0.95rem",
  },
  summaryHeading: {
    color: "#2563eb",
    marginBottom: "8px",
    fontSize: "1.1rem",
  },
  status: {
    marginTop: "15px",
    fontStyle: "italic",
    color: "#475569",
    fontSize: "0.9rem",
  },
};
