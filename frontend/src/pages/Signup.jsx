import { useState } from "react";
import api from "../utils/api";
import { deriveKEK, generateUEK, wrapUEK } from "../crypto/keygen";
import { useNavigate } from "react-router-dom";
import { layout, text, inputs, buttons, colors } from "../styles/theme";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const precheck = await api.post("/auth/check-email", { email });
      if (precheck.data.exists) {
        setAccountExists(true);
        return;
      }

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltBase64 = btoa(String.fromCharCode(...salt));
      const kek = await deriveKEK(password, saltBase64);
      const uek = await generateUEK();
      const { wrappedUEK, ivBase64 } = await wrapUEK(uek, kek);
      const rawUEK = await crypto.subtle.exportKey("raw", uek);
      const recovery = btoa(String.fromCharCode(...new Uint8Array(rawUEK)));
      setRecoveryKey(recovery);

      await api.post("/auth/signup", {
        email,
        password,
        salt: saltBase64,
        wrappedUEK,
        uekIV: ivBase64,
      });

      alert("✅ Account created successfully! Save your Recovery Key safely.");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed. Please try again later.");
    }
  };

  return (
    <div style={layout.wrapper}>
      <div style={layout.card}>
        <h2 style={text.heading}>Create Your CrypKey Account</h2>
        <p style={text.subtext}>
          Securely encrypt your world — sign up to get started.
        </p>

        {/* Signup Form */}
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            style={inputs.base}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={inputs.base}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={buttons.primary} type="submit">
            🚀 Sign Up
          </button>
        </form>

        {/* Recovery Key Display */}
        {recoveryKey && (
          <div style={{
            marginTop: "20px",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            padding: "15px",
          }}>
            <h4 style={{ color: colors.primary }}>🔑 Your Recovery Key</h4>
            <p style={{ color: colors.textMuted, fontSize: "0.9rem" }}>
              Save this securely. You’ll need it to recover your account.
            </p>
            <textarea
              readOnly
              value={recoveryKey}
              style={inputs.textarea}
            />
            <button style={{ ...buttons.secondary, width: "100%", marginTop: "10px" }} onClick={() => navigate("/login")}>
              Go to Login →
            </button>
          </div>
        )}

        {/* Existing Account Warning */}
        {accountExists && (
          <div style={{
            marginTop: "20px",
            background: "#fff7ed",
            border: `1px solid #f59e0b`,
            borderRadius: "10px",
            padding: "15px",
          }}>
            <p style={{ color: "#92400e" }}>
              ⚠️ An account with this email already exists. <br />
              👉 If it’s yours, please <b>Login</b>. <br />
              🔑 Or reset your password using your <b>Recovery Key</b>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <button onClick={() => navigate("/login")} style={buttons.secondary}>
                Login
              </button>
              <button onClick={() => navigate("/recover")} style={buttons.primary}>
                Reset Password
              </button>
              <button onClick={() => setAccountExists(false)} style={buttons.danger}>
                ✖ Close
              </button>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div style={{
          marginTop: "30px",
          textAlign: "center",
          background: colors.surface,
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          padding: "15px",
        }}>
          <p>Already have an account?</p>
          <button onClick={() => navigate("/login")} style={buttons.primary}>
            🔐 Go to Login
          </button>

          <p style={{ marginTop: "10px" }}>Forgot your password?</p>
          <button onClick={() => navigate("/recover")} style={buttons.secondary}>
            ♻️ Recover with Key
          </button>

          <p style={{ marginTop: "10px" }}>Go back to homepage</p>
          <button onClick={() => navigate("/")} style={buttons.neutral}>
            🏠 Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
