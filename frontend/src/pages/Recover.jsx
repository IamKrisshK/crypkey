import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { layout, text, inputs, buttons } from "../styles/theme";

export default function Recover() {
  const [email, setEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();
    setStatus("⏳ Processing...");
    try {
      const res = await api.post("/auth/recover", {
        email,
        recoveryKeyBase64: recoveryKey.trim(),
        newPassword,
      });
      alert(res.data.msg);
      navigate("/login");
    } catch (err) {
      setStatus("❌ Recovery failed.");
      console.error(err);
    }
  };

  return (
    <div style={layout.wrapper}>
      <div style={layout.card}>
        <h2 style={text.heading}>Recover Your Account</h2>
        <p style={text.subtext}>Use your recovery key to reset your password.</p>

        <form onSubmit={handleRecover} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            style={inputs.base}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            style={inputs.textarea}
            placeholder="Paste your Recovery Key"
            value={recoveryKey}
            onChange={(e) => setRecoveryKey(e.target.value)}
            required
          />
          <input
            style={inputs.base}
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" style={buttons.primary}>
            Reset Password
          </button>
        </form>

        {status && <p style={text.status}>{status}</p>}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={() => navigate("/login")} style={buttons.secondary}>
            Go to Login
          </button>
          <button onClick={() => navigate("/")} style={{ ...buttons.neutral, marginLeft: "8px" }}>
            Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
