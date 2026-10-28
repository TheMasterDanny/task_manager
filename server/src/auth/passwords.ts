import argon2 from "argon2";

// OWASP's recommended argon2id settings. The library defaults use 64 MiB per hash,
// which could exhaust the small memory of a free hosting plan under a few logins at once.
const options = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => argon2.hash(password, options);

export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);

// Checked against when the email doesn't exist, so that case takes as long as a wrong password
// and response times don't reveal which emails have an account.
const dummyHash = hashPassword("not-a-real-password");

export async function verifyDummyPassword(password: string) {
  await argon2.verify(await dummyHash, password);
}
