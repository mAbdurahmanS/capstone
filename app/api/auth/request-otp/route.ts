import { NextResponse } from "next/server";
import sql from "@/lib/data";
import { sendMail } from "@/utils/sendMail";
import { generateOTP } from "@/utils/otp";
import { comparePassword } from "@/utils/bcrypt"; // pastikan sudah ada util ini

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Ambil user dan hash password dari DB
  const result = await sql`
    SELECT id, name, password FROM users WHERE email = ${email} LIMIT 1
  `;

  if (!result.length) {
    return NextResponse.json(
      { error: "Email not registered" },
      { status: 404 }
    );
  }

  const user = result[0];

  // Bandingkan password yang diinput dengan yang di-hash
  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Generate OTP dan waktu expired
  const otp = generateOTP(); // contoh: 6 digit random
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // expired in 5 menit

  // Simpan ke DB (hapus OTP lama terlebih dulu jika perlu)
  await sql`
    DELETE FROM otps WHERE email = ${email}
  `;

  await sql`
    INSERT INTO otps (email, code, expires_at)
    VALUES (${email}, ${otp}, ${expiresAt})
  `;

  // Kirim OTP ke email
  await sendMail({
    to: email,
    subject: "Kode OTP Login Anda",
    text: `Kode OTP Anda adalah: ${otp}. Berlaku selama 5 menit.`,
  });

  return NextResponse.json({ message: "OTP sent to email" });
}
