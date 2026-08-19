import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as responseService from "../services/response.service.js";
import { getFormAnalytics } from "../services/analytics.service.js";
import { responsesToCsv } from "../utils/csv.js";

export const submitResponse = asyncHandler(async (req, res) => {
  const { answers, completionTime } = req.body;
  const meta = {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  };
  const response = await responseService.submitResponse(req.params.slug, {
    answers,
    completionTime,
    meta,
  });
  sendSuccess(res, {
    statusCode: 201,
    message: "Response recorded",
    data: { id: response._id },
  });
});

export const getResponses = asyncHandler(async (req, res) => {
  const responses = await responseService.listResponses(
    req.params.id,
    req.user._id,
    {
      search: req.query.search || "",
    },
  );
  sendSuccess(res, { data: { responses, count: responses.length } });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getFormAnalytics(req.params.id, req.user._id);
  sendSuccess(res, { data: { analytics } });
});

export const deleteResponse = asyncHandler(async (req, res) => {
  await responseService.deleteResponse(req.params.id, req.user._id);
  sendSuccess(res, { message: "Response deleted" });
});

export const exportResponses = asyncHandler(async (req, res) => {
  const { form, responses } = await responseService.exportResponses(
    req.params.id,
    req.user._id,
  );
  const csv = responsesToCsv(form, responses);
  const filename = `${form.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_responses.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});
