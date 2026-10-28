import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { hashPassword, verifyDummyPassword, verifyPassword } from "./passwords.ts";
import { requireAuth } from "./requireAuth.ts";
import { signToken } from "./tokens.ts";

export const authRouter = Router();

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  // The max keeps someone from making the server hash a huge string.
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

// Only these fields ever leave the server; never the password hash.
const publicUser = { id: true, email: true } as const;

const tooManyAttempts = { error: "Too many attempts, try again later" };

// Slows down password guessing: 10 failed logins per IP every 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: tooManyAttempts,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: tooManyAttempts,
});

authRouter.post("/register", registerLimiter, async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid data", issues: z.flattenError(parsed.error).fieldErrors });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
      select: publicUser,
    });
    res.status(201).json({ token: await signToken(user.id), user });
  } catch (err) {
    // P2002: unique constraint, the email is already taken.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    throw err;
  }
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  const invalid = { error: "Invalid email or password" };
  if (!parsed.success) {
    res.status(401).json(invalid);
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message and similar timing whether the email or the password is wrong.
  if (!user) {
    await verifyDummyPassword(password);
    res.status(401).json(invalid);
    return;
  }
  if (!(await verifyPassword(user.passwordHash, password))) {
    res.status(401).json(invalid);
    return;
  }

  res.json({ token: await signToken(user.id), user: { id: user.id, email: user.email } });
});

// Lets the frontend check a saved token and get the signed-in user.
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: publicUser });
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.json({ user });
});
