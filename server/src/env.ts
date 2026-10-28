import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see server/.env.example)`);
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters long");

export const env = {
  databaseUrl: required("DATABASE_URL"),
  clientOrigins: required("CLIENT_ORIGIN").split(",").map((o) => o.trim()),
  jwtSecret,
  port: Number(process.env["PORT"] ?? 3000),
};
