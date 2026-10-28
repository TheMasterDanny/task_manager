import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";
import { env } from "./env.ts";

// Channel binding ties the password check to the TLS connection, blocking man-in-the-middle attacks.
const adapter = new PrismaPg({ connectionString: env.databaseUrl, enableChannelBinding: true });

export const prisma = new PrismaClient({ adapter });
