import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as formService from "../services/form.service.js";

export const getForms = asyncHandler(async (req, res) => {
  const { search, filter } = req.query;
  const forms = await formService.listForms(req.user._id, { search, filter });
  sendSuccess(res, { data: { forms } });
});

export const getForm = asyncHandler(async (req, res) => {
  const form = await formService.getFormById(req.params.id, req.user._id);
  sendSuccess(res, { data: { form } });
});

export const getPublicForm = asyncHandler(async (req, res) => {
  await formService.registerView(req.params.slug);
  const form = await formService.getPublicForm(req.params.slug);
  sendSuccess(res, { data: { form } });
});

export const createForm = asyncHandler(async (req, res) => {
  const form = await formService.createForm(req.user._id, req.body);
  sendSuccess(res, {
    statusCode: 201,
    message: "Form created",
    data: { form },
  });
});
export const updateForm = asyncHandler(async (req, res) => {
  const form = await formService.updateForm(
    req.params.id,
    req.user._id,
    req.body,
  );
  sendSuccess(res, { message: "Form saved", data: { form } });
});

export const publishForm = asyncHandler(async (req, res) => {
  const shouldPublish = req.body.publish !== false;
  const form = await formService.setPublishState(
    req.params.id,
    req.user._id,
    shouldPublish,
  );
  sendSuccess(res, {
    message: shouldPublish ? "Form published" : "Form unpublished",
    data: { form },
  });
});

export const duplicateForm = asyncHandler(async (req, res) => {
  const form = await formService.duplicateForm(req.params.id, req.user._id);
  sendSuccess(res, {
    statusCode: 201,
    message: "Form duplicated",
    data: { form },
  });
});

export const deleteForm = asyncHandler(async (req, res) => {
  await formService.deleteForm(req.params.id, req.user._id);
  sendSuccess(res, { message: "Form deleted" });
});


