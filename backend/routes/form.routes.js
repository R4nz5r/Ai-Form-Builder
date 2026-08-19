import { Router } from "express";
import {
  getForms,
  getForm,
  createForm,
  updateForm,
  publishForm,
  duplicateForm,
  deleteForm,
} from "../controllers/form.controller.js";
import { protect } from "../middlewares/auth.js";

const router = Router();
router.use(protect);
router.route("/").get(getForms).post(createForm);
router.route("/:id").get(getForm).put(updateForm).delete(deleteForm);
router.post("/:id/publish", publishForm);
router.post("/:id/duplicate", duplicateForm);

export default router;
