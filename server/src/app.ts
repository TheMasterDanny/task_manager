import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRouter } from "./auth/routes.ts";
import { prisma } from "./db.ts";
import { env } from "./env.ts";

export const app = express();

// Hosting providers put a proxy in front of the API. Trusting one hop makes req.ip the
// real client IP, which the login rate limit depends on.
app.set("trust proxy", 1);

// Security headers, and only our frontend may call the API from a browser.
app.use(helmet());
app.use(cors({ origin: env.clientOrigins }));
app.use(express.json({ limit: "100kb" }));

// Used by Render to know the API is up, and to check the database connection.
app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Never leak stack traces or database errors to the client.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Client mistakes caught by express.json, like malformed JSON or a body that's too large.
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ error: "Invalid request" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
