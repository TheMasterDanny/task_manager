import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see server/.env.example)`);
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  clientOrigins: required("CLIENT_ORIGIN").split(",").map((o) => o.trim()),
  port: Number(process.env["PORT"] ?? 3000),
};
