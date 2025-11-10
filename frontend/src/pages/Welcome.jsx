import React from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "../styles/theme";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔐 Welcome to CrypKey</h1>
      <p style={styles.subtitle}>
        Your personal zero-knowledge encrypted file vault.
      </p>

      <div style={styles.section}>
        <h2 style={styles.heading}>What is CrypKey?</h2>
        <p style={styles.text}>
          CrypKey is a secure cloud vault that lets you store, manage, and share
          your files — without ever revealing your private data to anyone,
          including us. Every file you upload is encrypted **locally in your
          browser** before leaving your device.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>How Does It Work?</h2>
        <p style={styles.text}>
          CrypKey uses **end-to-end, zero-knowledge encryption**, meaning only
          you have access to your encryption keys. When you upload a file, it’s
          converted into secure ciphertext using AES-256 and your unique secret
          key — which never touches our servers.
        </p>
        <ul style={styles.list}>
          <li>🔒 Encryption and decryption happen locally in your browser.</li>
          <li>🧩 Your password never leaves your device — not even as a hash.</li>
          <li>🪶 Files are stored lightweight, compressed, and integrity-checked.</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>Why CrypKey is Different</h2>
        <p style={styles.text}>
          Unlike traditional cloud services that can access your data, CrypKey
          is designed on a **zero-trust architecture** — we assume that every
          server and network in between can be compromised, so your data is
          encrypted before it ever leaves your system.
        </p>
        <ul style={styles.list}>
          <li>🚫 We can’t see your files, even if we wanted to.</li>
          <li>🧠 Open-source cryptography algorithms — transparent and verifiable.</li>
          <li>⚙️ Optimized for both privacy and performance with chunked uploads.</li>
          <li>🌍 Accessible anywhere, yet as secure as offline storage.</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>Get Started</h2>
        <p style={styles.text}>
          Create an account and start storing your data securely within seconds.
          No setup, no special software — just pure, browser-based encryption.
        </p>
        <div style={styles.actions}>
          <button style={styles.btn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button style={styles.btnOutline} onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>
          © {new Date().getFullYear()} CrypKey — Built for those who value privacy.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    background: "linear-gradient(135deg, #f9fafb, #dbeafe)", // soft white → light blue
    color: "#1e293b", // neutral text
    padding: "2rem",
    overflowY: "auto",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#0f172a", // deep neutral
  },
  subtitle: {
    fontSize: "1.2rem",
    opacity: 0.8,
    marginBottom: "2.5rem",
    maxWidth: "600px",
    color: "#334155", // softer gray-blue
  },
  section: {
    maxWidth: "800px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // soft shadow
    border: "1px solid #e2e8f0", // light gray border
  },
  heading: {
    fontSize: "1.6rem",
    marginBottom: "0.8rem",
    color: "#2563eb", // CrypKey blue
  },
  text: {
    fontSize: "1.05rem",
    lineHeight: "1.6",
    marginBottom: "1rem",
    color: "#334155",
  },
  list: {
    textAlign: "left",
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "#475569",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1.2rem",
  },
  btn: {
    background: "#2563eb", // bright blue primary
    color: "white",
    border: "none",
    padding: "0.9rem 1.7rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  btnOutline: {
    background: "transparent",
    color: "#2563eb",
    border: "2px solid #2563eb",
    padding: "0.9rem 1.7rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  footer: {
    marginTop: "2rem",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "1.2rem",
    width: "100%",
    textAlign: "center",
    color: "#64748b",
  },
};

