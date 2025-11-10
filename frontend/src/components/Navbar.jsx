import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "#38bdf8" : "#94a3b8");

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand} onClick={() => navigate("/")}>
        🔐 <span style={{ fontWeight: "600" }}>CrypKey</span>
      </div>

      <div style={styles.links}>
        <button onClick={() => navigate("/")} style={{ ...styles.link, color: isActive("/") }}>
          Home
        </button>
        <button onClick={() => navigate("/signup")} style={{ ...styles.link, color: isActive("/signup") }}>
          Signup
        </button>
        <button onClick={() => navigate("/login")} style={{ ...styles.link, color: isActive("/login") }}>
          Login
        </button>
        <button onClick={() => navigate("/recover")} style={{ ...styles.link, color: isActive("/recover") }}>
          Recover
        </button>
        <button onClick={() => navigate("/dashboard")} style={{ ...styles.link, color: isActive("/dashboard") }}>
          Dashboard
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    borderBottom: "1px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brand: {
    color: "#faefefff",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  links: {
    display: "flex",
    gap: "14px",
  },
  link: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#e6f0ffff",
    transition: "color 0.2s ease",
  },
};
