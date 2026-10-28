import { jwtVerify, SignJWT } from "jose";
import { env } from "../env.ts";

const secret = new TextEncoder().encode(env.jwtSecret);
const ALGORITHM = "HS256";
const TOKEN_TTL = "12h";

export function signToken(userId: string) {
  return new SignJWT()
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secret);
}

/** Returns the user id, or null if the token is invalid or expired. */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    // Pinning the algorithm stops a forged token from choosing a weaker one.
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
