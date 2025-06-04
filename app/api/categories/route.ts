import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get all data
export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM categories 
    `;
    return NextResponse.json(categories);
  } catch (err) {
    console.error("🔥 ERROR GET /api/categories:", err);
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
    const existingCategories = await sql`
      SELECT id FROM categories WHERE name = ${name} LIMIT 1
    `;

    if (existingCategories.length > 0) {
      return NextResponse.json(
        { error: "Category already registered" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO categories (
        name
      ) VALUES (
        ${name}
      )
    `;

    return NextResponse.json({ message: "Category added" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/categories:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
