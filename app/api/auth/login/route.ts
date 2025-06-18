import sql from "@/lib/data";
import { comparePassword } from "@/utils/bcrypt";
import { generateToken } from "@/utils/jwt";
import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const row = await sql`
    SELECT u.id, u.name, u.email, u.password, u.role_id, u.company,
    r.name AS role FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = ${email}
    LIMIT 1
  `;

  if (!row.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await comparePassword(password, row[0].password);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = {
    id: row[0].id,
    name: row[0].name,
    email: row[0].email,
    company: row[0].company,
    role: {
      id: row[0].role_id,
      name: row[0].role,
    },
  };

  const token = await generateToken(user);

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
