import { Router } from "express";
import {
  register,
  login,
  getMe,
  patchProfile,
  patchPassword,
  deleteAccount,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, patchProfile);
router.put("/password", protect, patchPassword);
router.delete("/me", protect, deleteAccount);

export default router;
