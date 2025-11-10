import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { webcrypto } from "crypto";

dotenv.config();

const crypto = webcrypto;
const dataFile = path.resolve("src/data/users.json");

function readUsers() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile, "utf8") || "[]");
}

function saveUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}
export const checkEmail = (req, res) => {
  const { email } = req.body;
  const users = readUsers();
  const exists = users.some((u) => u.email === email);
  res.json({ exists });
};

export const signup = async (req, res) => {
  try {
    const { email, password, salt, wrappedUEK, uekIV } = req.body;

    const users = readUsers();
    const existing = users.find((u) => u.email === email);
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = { email, passwordHash, salt, wrappedUEK, uekIV };
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ msg: "Signup successful" });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        email: user.email,
        salt: user.salt,
        wrappedUEK: user.wrappedUEK,
        uekIV: user.uekIV,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
};

export const recoverAccount = async (req, res) => {
  try {
    const { email, recoveryKeyBase64, newPassword } = req.body;
    if (!email || !recoveryKeyBase64 || !newPassword)
      return res.status(400).json({ msg: "Missing fields" });

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const rawUEK = Uint8Array.from(atob(recoveryKeyBase64), c => c.charCodeAt(0));
    const uek = await crypto.subtle.importKey(
      "raw",
      rawUEK,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    const newSaltBase64 = Buffer.from(newSalt).toString("base64");
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey("raw", enc.encode(newPassword), "PBKDF2", false, ["deriveKey"]);
    const kek = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: newSalt, iterations: 200000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const newIv = crypto.getRandomValues(new Uint8Array(12));
    const rawUEKBuffer = await crypto.subtle.exportKey("raw", uek);
    const wrappedUEKBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: newIv }, kek, rawUEKBuffer);
    const wrappedUEK = Buffer.from(wrappedUEKBuffer).toString("base64");
    const ivBase64 = Buffer.from(newIv).toString("base64");
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.salt = newSaltBase64;
    user.wrappedUEK = wrappedUEK;
    user.uekIV = ivBase64;

    saveUsers(users);

    res.json({ msg: "Password reset successfully! Please login again." });
  } catch (err) {
    console.error("Recovery error:", err);
    res.status(500).json({ msg: "Recovery failed", error: err.message });
  }
};

