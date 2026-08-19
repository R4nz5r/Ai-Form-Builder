import { Router } from "express";
import {
  generateForm,
  generateValidation,
  improveQuestion,
  formSummary,
} from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.use(protect);
router.post("/generate-form", generateForm);
router.post("/generate-validation", generateValidation);
router.post("/improve-question", improveQuestion);
router.post("/form-summary", formSummary);

export default router;
