import { type Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../db.ts";
import { Prisma, type Task } from "../generated/prisma/client.ts";
import { Priority, Status } from "../generated/prisma/enums.ts";
import { requireAuth } from "../auth/requireAuth.ts";

export const tasksRouter = Router();
tasksRouter.use(requireAuth);

// Same shape and formats as the frontend's Task (src/store/useTaskStore.ts).
const taskFields = z.object({
  title: z.string().trim().min(1).max(200),
  status: z.enum(Status),
  priority: z.enum(Priority),
  date: z.union([z.literal(""), z.iso.date()]),
  time: z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]),
  prevStatus: z.enum(Status).nullish(),
});

const moveBody = z.object({
  status: z.enum(Status),
  beforeId: z.uuid().nullable(),
});

const importBody = z.object({
  tasks: z.array(taskFields).max(500),
});

const taskId = z.uuid();

/** What the frontend gets: no userId, position or timestamps. */
function toClientTask(task: Task) {
  const { id, title, status, priority, date, time, prevStatus } = task;
  return { id, title, status, priority, date, time, ...(prevStatus && { prevStatus }) };
}

function invalid(res: Response, error: z.ZodError) {
  res.status(400).json({ error: "Invalid data", issues: z.flattenError(error).fieldErrors });
}

function notFound(res: Response) {
  res.status(404).json({ error: "Task not found" });
}

// P2025: the record to update or delete doesn't exist (or isn't this user's).
const isNotFound = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";

async function lastPosition(userId: string) {
  const { _max } = await prisma.task.aggregate({ where: { userId }, _max: { position: true } });
  return _max.position ?? 0;
}

tasksRouter.get("/", async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId! },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  res.json({ tasks: tasks.map(toClientTask) });
});

tasksRouter.post("/", async (req, res) => {
  const parsed = taskFields.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed.error);

  const userId = req.userId!;
  const task = await prisma.task.create({
    data: { ...parsed.data, userId, position: (await lastPosition(userId)) + 1 },
  });
  res.status(201).json({ task: toClientTask(task) });
});

// Uploads a guest's localStorage tasks after they create an account, keeping their order.
tasksRouter.post("/import", async (req, res) => {
  const parsed = importBody.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed.error);

  const userId = req.userId!;
  const start = await lastPosition(userId);
  // New ids are generated: ids sent by the client are never trusted as primary keys.
  await prisma.task.createMany({
    data: parsed.data.tasks.map((t, i) => ({ ...t, userId, position: start + i + 1 })),
  });

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  res.status(201).json({ tasks: tasks.map(toClientTask) });
});

tasksRouter.patch("/:id", async (req, res) => {
  const id = taskId.safeParse(req.params.id);
  if (!id.success) return notFound(res);
  const parsed = taskFields.partial().safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed.error);

  try {
    // Filtering by userId too means nobody can edit someone else's task.
    const task = await prisma.task.update({
      where: { id: id.data, userId: req.userId! },
      data: parsed.data,
    });
    res.json({ task: toClientTask(task) });
  } catch (err) {
    if (isNotFound(err)) return notFound(res);
    throw err;
  }
});

/** Moves a task to `status`, placed before `beforeId` (or at the end when null), like moveTask in the store. */
tasksRouter.patch("/:id/move", async (req, res) => {
  const id = taskId.safeParse(req.params.id);
  if (!id.success) return notFound(res);
  const parsed = moveBody.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed.error);

  const userId = req.userId!;
  const { status, beforeId } = parsed.data;

  const task = await prisma.task.findFirst({ where: { id: id.data, userId } });
  if (!task) return notFound(res);
  if (beforeId === task.id) {
    res.json({ task: toClientTask(task) });
    return;
  }

  let position = await positionBefore(userId, task.id, beforeId);
  if (position === null) {
    // Ran out of room between two floats after many moves: space everything out and retry.
    await renumber(userId);
    position = await positionBefore(userId, task.id, beforeId);
  }
  if (position === undefined) {
    res.status(400).json({ error: "Invalid data", issues: { beforeId: ["Task not found"] } });
    return;
  }
  // Can't happen after renumbering (positions are 1 apart), but keeps a bad value out of the database.
  if (position === null) throw new Error("No room to place the task");

  const moved = await prisma.task.update({ where: { id: task.id }, data: { status, position } });
  res.json({ task: toClientTask(moved) });
});

/**
 * Position for a task placed right before `beforeId`, or after every other task when null.
 * Returns undefined if `beforeId` isn't one of the user's tasks, and null if there's no room left.
 */
async function positionBefore(userId: string, movingId: string, beforeId: string | null) {
  if (!beforeId) return (await lastPosition(userId)) + 1;

  const before = await prisma.task.findFirst({ where: { id: beforeId, userId } });
  if (!before) return undefined;

  const previous = await prisma.task.findFirst({
    where: { userId, id: { not: movingId }, position: { lt: before.position } },
    orderBy: { position: "desc" },
  });
  if (!previous) return before.position - 1;

  const middle = (previous.position + before.position) / 2;
  return middle > previous.position && middle < before.position ? middle : null;
}

/** Resets the user's positions to 1, 2, 3... keeping their order. */
async function renumber(userId: string) {
  await prisma.$executeRaw`
    UPDATE "Task" AS t SET position = r.n
    FROM (
      SELECT id, row_number() OVER (ORDER BY position, "createdAt") AS n
      FROM "Task" WHERE "userId" = ${userId}
    ) AS r
    WHERE t.id = r.id`;
}

tasksRouter.delete("/:id", async (req, res) => {
  const id = taskId.safeParse(req.params.id);
  if (!id.success) return notFound(res);

  try {
    await prisma.task.delete({ where: { id: id.data, userId: req.userId! } });
    res.status(204).end();
  } catch (err) {
    if (isNotFound(err)) return notFound(res);
    throw err;
  }
});
