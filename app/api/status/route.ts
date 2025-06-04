import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get all data
export async function GET() {
  try {
    const status = await sql`
      SELECT * FROM status 
    `;
    return NextResponse.json(status);
  } catch (err) {
    console.error("🔥 ERROR GET /api/status:", err);
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
    const existingStatus = await sql`
      SELECT id FROM status WHERE name = ${name} LIMIT 1
    `;

    if (existingStatus.length > 0) {
      return NextResponse.json(
        { error: "Status already registered" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO status (
        name
      ) VALUES (
        ${name}
      )
    `;

    return NextResponse.json({ message: "Status added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/status:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
