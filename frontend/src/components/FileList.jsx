import React, { useState } from "react";
import JSZip from "jszip";
import api from "../utils/api";
import { layout, text, buttons, colors } from "../styles/theme";

export default function FileList({ uek, user, files, setFiles }) {
  const [status, setStatus] = useState("");

  const b64ToArr = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  // 🔓 Decrypt + Download
  const handleDecrypt = async (fileMeta) => {
    try {
      setStatus(`⬇️ Downloading ${fileMeta.originalName}...`);
      const response = await fetch(`http://localhost:8080/api/files/download/${fileMeta.id}`);
      if (!response.ok) return setStatus("❌ File not found on server.");

      const cipherArrayBuffer = await response.arrayBuffer();

      // Unwrap CEK
      const wrappedArr = b64ToArr(fileMeta.wrappedCEK);
      const cekIv = b64ToArr(fileMeta.iv);
      const cekRaw = await crypto.subtle.decrypt({ name: "AES-GCM", iv: cekIv }, uek, wrappedArr);
      const cekKey = await crypto.subtle.importKey("raw", cekRaw, "AES-GCM", true, ["decrypt"]);

      // Decrypt file
      const fileIv = b64ToArr(fileMeta.fileIv);
      setStatus("🔓 Decrypting...");
      const plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fileIv },
        cekKey,
        cipherArrayBuffer
      );

      // Decompress
      setStatus("📦 Decompressing...");
      const zip = await JSZip.loadAsync(new Blob([plaintextBuffer]));
      const filenames = Object.keys(zip.files);
      const firstFile = filenames[0];
      const originalFile = await zip.file(firstFile).async("blob");

      // Download file
      const a = document.createElement("a");
      a.href = URL.createObjectURL(originalFile);
      a.download = firstFile;
      a.click();

      setStatus("✅ File decrypted and downloaded!");
    } catch (err) {
      console.error("Decryption error:", err);
      setStatus("❌ Failed to decrypt/decompress file.");
    }
  };

  // 🗑️ Delete File
  const handleDelete = async (fileMeta) => {
    const confirmDelete = window.confirm(`Delete "${fileMeta.originalName}" permanently?`);
    if (!confirmDelete) return;

    try {
      setStatus(`🗑️ Deleting ${fileMeta.originalName}...`);
      const res = await api.delete(`/files/delete/${fileMeta.id}`);
      if (res.data.ok) {
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
                <em>{f.docType || "Unknown type"}</em> • {f.tags?.join(", ") || "No tags"}
              </small>
              <p style={styles.summaryText}>{f.summary || "No summary available."}</p>
            </div>
            <div style={styles.btnRow}>
              <button onClick={() => handleDecrypt(f)} style={buttons.secondary}>
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

// 🎨 Styles using theme tokens
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
  btnRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};
