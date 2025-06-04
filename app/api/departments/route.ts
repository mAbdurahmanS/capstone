import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get all data
export async function GET() {
  try {
    const departments = await sql`
      SELECT * FROM departments 
    `;
    return NextResponse.json(departments);
  } catch (err) {
    console.error("🔥 ERROR GET /api/departments:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ➕ Create new data
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields: name" },
        { status: 400 }
      );
    }

    // Cek apakah email sudah dipakai
    const existingDepartments = await sql`
      SELECT id FROM departments WHERE name = ${name} LIMIT 1
    `;

    if (existingDepartments.length > 0) {
      return NextResponse.json(
        { error: "Department already registered" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO departments (
        name
      ) VALUES (
        ${name}
      )
    `;

    return NextResponse.json({ message: "Department added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/departments:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
