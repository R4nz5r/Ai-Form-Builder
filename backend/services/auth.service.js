import bycrypt from "bcryptjs";
import { ApiError } from "../utils/apiError.js";
import { signToken } from "../utils/token.js";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserProfile,
  updateUserPassword,
} from "../repositories/user.repo.js";

const AVATAR_COLORS = [
  "#0c8b7c",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#059669",
];

function pickAvatarColor(seed) {
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
  };
}

export async function registerUser({ name, email, password }) {
  if (name.trim().length < 2)
    throw ApiError.badRequest("Name must be at least 2 characters long");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw ApiError.badRequest("Please provide a valid email address");
  if (password.trim().length < 6)
    throw ApiError.badRequest("Password must be at least 6 characters long");
  const existing = await findUserByEmail(email);
  if (existing)
    throw ApiError.conflict("An account with this email already exists");

  const hash = await bycrypt.hash(password, 10);
  const user = await createUser({
    name: name.trim(),
    email,
    password: hash,
    avatarColor: pickAvatarColor(email),
  });
  const token = signToken({ id: user._id });
  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email, { withPassword: true });
  if (!user) throw ApiError.notFound("Invalid email or password");

  const isMatch = await bycrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.notFound("Invalid email or password");

  const token = signToken({ id: user._id });
  return { user: toPublicUser(user), token };
}

export async function updateProfile(userId, { name, avatarColor }) {
  const user = await updateUserProfile(userId, {
    name: name?.trim() || null,
    avatarColor,
  });
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("Current password and new password are required");
  }
  if (newPassword.length < 6) {
    throw ApiError.badRequest(
      "New password must be at least 6 characters long",
    );
  }

  const user = await findUserByEmail(userId, { withPassword: true });
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await bycrypt.compare(currentPassword, user.password);
  if (!isMatch) throw ApiError.unauthorized("Current password is incorrect");

  await updateUserPassword(userId, await bycrypt.hash(newPassword, 10));
}

export { toPublicUser };
