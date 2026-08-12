import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  registerUser,
  loginUser,
  toPublicUser,
  updateProfile,
  changePassword,
} from "../services/auth.service.js";
import { deleteUser } from "../repositories/user.repo.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email, and password are required");
  }
  const { user, token } = await registerUser({ name, email, password });
  sendSuccess(res, {
    status: 201,
    message: "Account created successfully",
    data: { user, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }
  const { user, token } = await loginUser({ email, password });
  sendSuccess(res, {
    message: "Logged in successfully",
    data: { user, token },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: toPublicUser(req.user) } });
});

export const patchProfile = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);
  sendSuccess(res, {
    message: "Profile updated successfully",
    data: { user },
  });
});

export const patchPassword = asyncHandler(async (req, res) => {
  await changePassword(req.user._id, req.body);
  sendSuccess(res, {
    message: "Password changed successfully",
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await deleteUser(req.user._id);
  sendSuccess(res, {
    message: "Account deleted successfully",
  });
});
