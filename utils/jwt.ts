// utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "1a50eed626e93bff716e44954a0a968907789c6d1f3dc0c79a2da27d67a70d48";

// Key untuk jose (harus berupa Uint8Array)
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

export async function generateToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}
