import { Router } from "express";
import {
  submitResponse,
  getResponses,
  getAnalytics,
  deleteResponse,
  exportResponses,
} from "../controllers/response.controller.js";
import { getPublicForm } from "../controllers/form.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.get("/public/forms/:slug", getPublicForm);
router.post("/public/forms/:slug/respond", submitResponse);
router.get("/forms/:id/responses", protect, getResponses);
router.get("/forms/:id/responses/export", protect, exportResponses);
router.get("/forms/:id/analytics", protect, getAnalytics);
router.delete("/responses/:id", protect, deleteResponse);

export default router;


