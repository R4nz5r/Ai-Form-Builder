import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";
import responseRoutes from "./routes/response.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin))
        return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api", responseRoutes);
app.use("/api", insightsRoutes);
app.use("/api/ai", aiRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
