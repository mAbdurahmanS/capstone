import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get all data
export async function GET() {
  try {
    const roles = await sql`
      SELECT * FROM roles 
    `;
    return NextResponse.json(roles);
  } catch (err) {
    console.error("🔥 ERROR GET /api/roles:", err);
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
    const existingRoles = await sql`
      SELECT id FROM roles WHERE name = ${name} LIMIT 1
    `;

    if (existingRoles.length > 0) {
      return NextResponse.json(
        { error: "Role already registered" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO roles (
        name
      ) VALUES (
        ${name}
      )
    `;

    return NextResponse.json({ message: "Role added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/roles:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
