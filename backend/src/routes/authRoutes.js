import express from "express";
import { signup, login, recoverAccount, checkEmail } from "../controllers/authController.js";

const router = express.Router();
router.post("/check-email", checkEmail);
router.post("/signup", signup);
router.post("/login", login);
router.post("/recover", recoverAccount);

export default router;
