import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./tokens.ts";

declare module "express-serve-static-core" {
  interface Request {
    /** Set by requireAuth: the id of the signed-in user. */
    userId?: string;
  }
}

/** Rejects requests without a valid "Authorization: Bearer <token>" header. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const userId = token ? await verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  req.userId = userId;
  next();
}
