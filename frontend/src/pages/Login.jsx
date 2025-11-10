import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { deriveKEK, unwrapUEK } from "../crypto/keygen";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("🔐 Logging in...");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user } = res.data;

      const kek = await deriveKEK(password, user.salt);
      const uek = await unwrapUEK(user.wrappedUEK, user.uekIV, kek);

      console.log("✅ Decrypted UEK ready:", uek);
      window.__UEK_KEY__ = uek;
      setUser(user);

      setStatus("✅ Login successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) setStatus("❌ Invalid credentials.");
      else if (err.response?.status === 404) setStatus("⚠️ No account found.");
      else setStatus("🚨 Login failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome Back 🔐</h2>
        <p style={styles.subtext}>Login to access your encrypted vault</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={styles.loginBtn}>
            Login
          </button>
        </form>

        {status && <p style={styles.status}>{status}</p>}

        <div style={styles.links}>
          <button onClick={() => navigate("/recover")} style={styles.linkBtn}>
            🔑 Forgot password?
          </button>
          <button onClick={() => navigate("/signup")} style={styles.linkBtn}>
            📝 Create Account
          </button>
          <button onClick={() => navigate("/")} style={styles.linkBtn}>
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f9fafb, #e0f2fe)", // soft gray → pale blue
    color: "#1e293b",
  },
  card: {
    background: "#ffffff",
    padding: "30px 40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "10px",
    color: "#2563eb", // strong CrypKey blue
  },
  subtext: {
    fontSize: "0.9rem",
    color: "#64748b", // soft neutral
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1", // light border
    background: "#f8fafc", // near white
    color: "#1e293b",
    fontSize: "1rem",
    outline: "none",
  },
  loginBtn: {
    background: "#2563eb", // primary blue
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
  },
  status: {
    marginTop: "15px",
    fontSize: "0.9rem",
    fontStyle: "italic",
    color: "#475569",
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "20px",
  },
  linkBtn: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#2563eb",
    borderRadius: "6px",
    padding: "8px 10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: "500",
  },
};
