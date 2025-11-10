import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  wrappedUEK: { type: String, required: true }, // encrypted user key blob
});

export default mongoose.model("User", userSchema);
