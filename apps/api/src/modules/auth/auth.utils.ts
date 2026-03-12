import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const HASH_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, currentHash] = storedHash.split(":");

  if (!salt || !currentHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, HASH_KEY_LENGTH);
  const hashBuffer = Buffer.from(currentHash, "hex");

  if (derivedKey.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, hashBuffer);
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
