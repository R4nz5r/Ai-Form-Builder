import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev_insecure_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
};

export const isProd = env.nodeEnv === "production";