import React, { useState } from "react";
import JSZip from "jszip";
import api from "../utils/api";
import { layout, text, buttons, colors } from "../styles/theme";

//Utility Functions 
function SummaryDisplay({ summaryData }) {
  if (!summaryData) {
    return <p style={summaryStyles.noSummary}>No summary available.</p>;
  }
  let parsedData;
  if (typeof summaryData !== "string") {
    parsedData = summaryData;
  } else {
    let cleanJsonString = summaryData.trim();
    const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);

    if (jsonMatch && jsonMatch[0]) {
      cleanJsonString = jsonMatch[0];
    }
    try {
      parsedData = JSON.parse(cleanJsonString);
    } catch (e) {
      parsedData = { summary: summaryData };
    }
  }
  const { 
    summary = "No summary text available.", 
    tags, 
    docType, 
    tone 
  } = parsedData;
  return (
    <div style={summaryStyles.summaryBox}>
      <p style={summaryStyles.summaryLine}>
        <b>🧾 Summary:</b> {summary}
      </p>
      
      {Array.isArray(tags) && tags.length > 0 && (
        <p style={summaryStyles.summaryLine}>
          <b>🏷️ Tags:</b> {tags.join(", ")}
        </p>
      )}
      {docType && (
        <p style={summaryStyles.summaryLine}>
          <b>📄 Document Type:</b> {docType}
        </p>
      )}      
      {tone && (
        <p style={summaryStyles.summaryLine}>
          <b>🎯 Tone:</b> {tone}
        </p>
      )}
    </div>
  );
}

const b64ToArr = (b64) => {
  if (!b64) return new Uint8Array();
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const downloadBlob = (blob, filename) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

//FileList Component
export default function FileList({ uek, user, files, setFiles }) {
  const [status, setStatus] = useState("");
  const handleDecrypt = async (fileMeta) => {
    try {
      setStatus(`⬇️ Downloading ${fileMeta.originalName}...`);
      const userKey = uek || window.__UEK_KEY__;
      if (!userKey || !(userKey instanceof CryptoKey)) {
        setStatus("❌ Missing or invalid UEK. Please log in again.");
        console.warn("UEK invalid:", userKey);
        return;
      }
      const res = await api.get(`/files/download/${fileMeta.id}`, {
        responseType: "arraybuffer",
      });
      if (res.status !== 200 || !res.data) {
        setStatus("❌ File not found on server.");
        return;
      }

      const cipherArrayBuffer = res.data;
      setStatus("🔐 Unwrapping CEK...");
      const wrappedArr = b64ToArr(fileMeta.wrappedCEK);
      const cekIv = b64ToArr(fileMeta.iv);
      const cekRaw = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: cekIv },
        userKey,
        wrappedArr
      );
      const cekKey = await crypto.subtle.importKey(
        "raw",
        cekRaw,
        "AES-GCM",
        true,
        ["decrypt"]
      );
      setStatus("🔓 Decrypting file...");
      const fileIv = b64ToArr(fileMeta.fileIv);
      const plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fileIv },
        cekKey,
        cipherArrayBuffer
      );
      setStatus("📦 Decompressing...");
      let originalBlob;
      let fileName;

      try {
        const zip = await JSZip.loadAsync(new Blob([plaintextBuffer]));
        const filenames = Object.keys(zip.files);
        fileName = filenames[0];
        originalBlob = await zip.file(fileName).async("blob");
      } catch (zipErr) {
        console.warn("Not a zip or failed to decompress:", zipErr);
        originalBlob = new Blob([plaintextBuffer]);
        fileName = fileMeta.originalName || "downloaded_file";
      }
      setStatus("⬇️ Preparing download...");
      downloadBlob(originalBlob, fileName);
      setStatus("✅ File decrypted and downloaded!");
    } catch (err) {
      console.error("Decryption error:", err);
      setStatus("❌ Failed to decrypt or decompress file.");
    }
  };

//Handle File Deletion
  const handleDelete = async (fileMeta) => {
    const confirmDelete = window.confirm(
      `Delete "${fileMeta.originalName}" permanently?`
    );
    if (!confirmDelete) return;

    try {
      setStatus(`🗑️ Deleting ${fileMeta.originalName}...`);
      const res = await api.delete(`/files/delete/${fileMeta.id}`);

      if (res.data?.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileMeta.id));
        setStatus("✅ File deleted successfully!");
      } else {
        setStatus("❌ Server failed to delete file.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setStatus("❌ Failed to delete file.");
    }
  };

//UI Rendering
  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>📁 Your Encrypted Files</h3>
      {!files || files.length === 0 ? (
        <p style={styles.emptyText}>No files uploaded yet.</p>
      ) : (
        files.map((f) => (
          <div key={f.id} style={styles.fileCard}>
            <div style={{ flex: 1 }}>
              <strong style={styles.fileName}>{f.originalName}</strong>
              <br />
              <small style={styles.metaText}>
                <em>{f.docType || "Unknown type"}</em> •{" "}
                {f.tags?.join(", ") || "No tags"}
              </small>
              <div style={{ marginTop: "10px" }}>
                <SummaryDisplay summaryData={f.summary} />
              </div>
            </div>
            <div style={styles.btnRow}>
              <button
                onClick={() => handleDecrypt(f)}
                style={buttons.secondary}
              >
                ⬇️ Download
              </button>
              <button onClick={() => handleDelete(f)} style={buttons.danger}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}

      <div style={text.status}>{status}</div>
    </div>
  );
}
//Styles using theme tokens
const styles = {
  container: {
    ...layout.card,
    maxWidth: "800px",
    margin: "30px auto",
    background: colors.surface,
  },
  heading: {
    ...text.heading,
    fontSize: "1.5rem",
    color: colors.primary,
    marginBottom: "20px",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: "1rem",
  },
  fileCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#ffffff",
    borderRadius: "10px",
    marginBottom: "12px",
    border: `1px solid ${colors.border}`,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  fileName: {
    fontSize: "1.05rem",
    color: colors.text,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: "0.85rem",
  },
  summaryText: {
    margin: "8px 0 0",
    color: colors.text,
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  summaryBox: {
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    padding: "12px 14px",
    marginTop: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    color: "#334155",
    fontSize: "0.9rem",
    lineHeight: "1.5",
  },

  summaryLine: {
    marginBottom: "6px",
  },

  btnRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};
const summaryStyles = {
  summaryBox: {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    maxWidth: '600px',
    margin: '20px 0',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
  },
  summaryLine: {
    margin: '5px 0',
    lineHeight: '1.4',
    fontSize: '15px',
  },
  noSummary: {
    color: '#c44040ff',
    fontWeight: 'bold',
  },
};