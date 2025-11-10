import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Recover from "./pages/Recover";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("crypkey-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("crypkey-user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("crypkey-user");
    }
  }, [user]);

  return (
    <Router>
        <Navbar /> {/* Persistent top bar */}
      <Routes>
        {/* Welcome page */}
        <Route path="/" element={<Welcome />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover" element={<Recover />} />
        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
