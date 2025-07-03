import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(
  process.env.AES_SECRET_KEY! || "aySnXebeWrZhVI9B9sODe/XdMyQ/+EfD27z235U3I/4=",
  "base64"
); // 32 bytes from Base64
const IV_LENGTH = 16; // 16 bytes for AES-256-CBC

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
