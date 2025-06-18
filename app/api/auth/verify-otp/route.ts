import sql from "@/lib/data";
import { generateToken } from "@/utils/jwt";
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP are required" },
      { status: 400 }
    );
  }

  const result = await sql`
    SELECT * FROM otps
    WHERE email = ${email} AND code = ${otp} AND expires_at > now()
    ORDER BY expires_at DESC
    LIMIT 1
  `;

  if (!result.length) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 401 }
    );
  }

  //   const userRow = await sql`
  //     SELECT id, name, email, role_id, company FROM users WHERE email = ${email} LIMIT 1
  //   `;
  const userRow = await sql`
      SELECT u.id, u.name, u.email, u.password, u.role_id, u.company,
      r.name AS role FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ${email}
      LIMIT 1
    `;

  if (!userRow.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = {
    id: userRow[0].id,
    name: userRow[0].name,
    email: userRow[0].email,
    company: userRow[0].company,
    role: {
      id: userRow[0].role_id,
      name: userRow[0].role,
    },
  };

  const token = await generateToken(user);

  // Hapus OTP setelah digunakan
  await sql`DELETE FROM otps WHERE email = ${email}`;

  const response = NextResponse.json({ token, user });
  response.headers.append(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  );

  return response;
}
