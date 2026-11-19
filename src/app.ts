import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import creatorRoutes from "./routes/creator";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "novels-twines-api",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/admin", adminRoutes);

app.use((_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (response.headersSent) return;

  if (error instanceof Error && error.message === "Origin is not allowed by CORS") {
    response.status(403).json({
      error: { code: "CORS_ORIGIN_DENIED", message: "Origin is not allowed." },
    });
    return;
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};

app.use(errorHandler);

export default app;
