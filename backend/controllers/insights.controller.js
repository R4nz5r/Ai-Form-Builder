import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getInsights, getInbox } from "../services/insights.service.js";

export const insights = asyncHandler(async (req, res) => {
  const data = await getInsights(req.user._id);
  sendSuccess(res, { data: { insights: data } });
});

export const inbox = asyncHandler(async (req, res) => {
  const responses = await getInbox(req.user._id, {
    search: req.query.search || "",
  });
  sendSuccess(res, { data: { responses, count: responses.length } });
});
