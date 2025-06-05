import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// 📄 Get all users
export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        u.id, u.name, u.email, u.role_id, u.department_id, u.company
        r.name AS role,
        d.name AS department
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
    `;

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      role: {
        id: row.role_id,
        name: row.role,
      },
      department: {
        id: row.department_id,
        name: row.department,
      },
    }));

    return NextResponse.json(users);
  } catch (err) {
    console.error("🔥 ERROR GET /api/users:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ➕ Create new user
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, password, role, department, company } = data;

    // Validasi input wajib
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, or password" },
        { status: 400 }
      );
    }

    const userRole = role ?? 3;
    const userDepartment = department ?? null;
    const userCompany = company ?? null;

    // Cek apakah email sudah dipakai
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (
        name, email, password, role_id, department_id, company
      ) VALUES (
        ${name}, ${email}, ${hashedPassword}, ${userRole}, ${userDepartment}, ${userCompany}
      )
    `;

    return NextResponse.json({ message: "User added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/users:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
