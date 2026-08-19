import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as aiService from "../services/ai.service.js";

export const generateForm = asyncHandler(async (req, res) => {
  const form = await aiService.generateForm(req.body.prompt);
  sendSuccess(res, { message: "Form generated", data: { form } });
});

export const generateValidation = asyncHandler(async (req, res) => {
  const validation = await aiService.generateValidation(req.body);
  sendSuccess(res, { message: "Validation suggested", data: { validation } });
});

export const improveQuestion = asyncHandler(async (req, res) => {
  const result = await aiService.improveQuestion(req.body);
  sendSuccess(res, { message: "Question improved", data: { result } });
});

export const formSummary = asyncHandler(async (req, res) => {
  const summary = await aiService.summarizeForm(req.body.form);
  sendSuccess(res, { message: "Summary ready", data: { summary } });
});
