import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Recover from "./pages/Recover";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [rehydrated, setRehydrated] = useState(false);
  useEffect(() => {
    const storedUser = sessionStorage.getItem("crypkey-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user:", err);
        sessionStorage.removeItem("crypkey-user");
      }
    }
    setRehydrated(true);
  }, []);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("crypkey-user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("crypkey-user");
    }
  }, [user]);

  if (!rehydrated) return <div>Loading...</div>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover" element={<Recover />} />

        {/* ✅ Protected route */}
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
