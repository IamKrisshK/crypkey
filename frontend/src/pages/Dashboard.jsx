import React, { useEffect, useState } from "react";
import api from "../utils/api";
import FileUploadCard from "../components/FileUploadCard";
import FileList from "../components/FileList";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const uek = window.__UEK_KEY__;

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files/list");
      const userFiles = res.data.filter((f) => f.owner === user.email);
      setFiles(userFiles);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("crypkey-user");
    window.__UEK_KEY__ = null;
    navigate("/");
    window.location.reload()
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Welcome, {user.email}</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </header>

      <section style={styles.section}>
        <FileUploadCard user={user} onUploadComplete={fetchFiles} />
        <FileList
          user={user}
          uek={uek}
          files={files}
          setFiles={setFiles}
          refreshFiles={fetchFiles}
        />
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #f9fafb, #e0f2fe)",
    color: "#1e293b",
    padding: "30px 20px",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "15px 25px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#2563eb",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
  },
  section: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  },
};
