import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see server/.env.example)`);
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters long");

// How many proxies sit in front of the API: 0 locally, 3 on Render (Cloudflare, Render's
// load balancer and a local proxy). Getting it wrong breaks the per-IP login rate limit,
// so it's required: a missing value stops the API instead of failing silently.
const trustProxyHops = Number(required("TRUST_PROXY_HOPS"));
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0)
  throw new Error("TRUST_PROXY_HOPS must be a whole number, 0 or more");

export const env = {
  databaseUrl: required("DATABASE_URL"),
  clientOrigins: required("CLIENT_ORIGIN").split(",").map((o) => o.trim()),
  jwtSecret,
  trustProxyHops,
  port: Number(process.env["PORT"] ?? 3000),
};
