import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get all data
export async function GET() {
  try {
    const priorities = await sql`
      SELECT * FROM priorities 
    `;
    return NextResponse.json(priorities);
  } catch (err) {
    console.error("🔥 ERROR GET /api/priorities:", err);
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
    const existingPriorities = await sql`
      SELECT id FROM priorities WHERE name = ${name} LIMIT 1
    `;

    if (existingPriorities.length > 0) {
      return NextResponse.json(
        { error: "Priority already registered" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO priorities (
        name
      ) VALUES (
        ${name}
      )
    `;

    return NextResponse.json({ message: "Priority added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/priorities:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
