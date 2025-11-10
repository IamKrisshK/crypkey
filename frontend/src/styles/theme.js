// src/styles/theme.js

export const colors = {
  background: "#f9fafb", // soft neutral background
  surface: "#ffffff", // white card
  border: "#e2e8f0", // light gray borders
  primary: "#2563eb", // CrypKey blue
  secondary: "#10b981", // success green
  danger: "#ef4444", // error red
  text: "#111827", // near-black text
  textMuted: "#6b7280", // muted text
  inputBg: "#f1f5f9", // input background
  inputBorder: "#cbd5e1",
};

export const layout = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: colors.background,
    color: colors.text,
    padding: "20px",
  },
  card: {
    background: colors.surface,
    borderRadius: "12px",
    padding: "30px 35px",
    width: "100%",
    maxWidth: "420px",
    border: `1px solid ${colors.border}`,
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },
};

export const text = {
  heading: {
    textAlign: "center",
    color: colors.primary,
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "10px",
  },
  subtext: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: "0.95rem",
    marginBottom: "20px",
  },
  status: {
    marginTop: "15px",
    textAlign: "center",
    color: colors.textMuted,
    fontStyle: "italic",
  },
};

export const inputs = {
  base: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${colors.inputBorder}`,
    background: colors.inputBg,
    color: "#fffffe",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    height: "100px",
    borderRadius: "8px",
    padding: "10px",
    border: `1px solid ${colors.inputBorder}`,
    background: colors.inputBg,
    color: "#ffffee",
    fontSize: "1rem",
  },
};

export const buttons = {
  primary: {
    background: colors.primary,
    color: "#ffffff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  secondary: {
    background: colors.secondary,
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  danger: {
    background: colors.danger,
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  neutral: {
    background: "#e5e7eb",
    color: colors.text,
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
