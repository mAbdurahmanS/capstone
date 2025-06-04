import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const categories = await sql`
            SELECT  * FROM categories
            WHERE id = ${id} LIMIT 1
          `;

    if (categories.length === 0) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(categories[0]);
  } catch (err) {
    console.error("🔥 ERROR GET /api/categories/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔄 Update data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await req.json();
    const { id } = await params; // wajib await params
    const { name } = data;

    const existingCategories = await sql`
      SELECT id FROM categories WHERE name = ${name} AND id != ${id} LIMIT 1
    `;

    if (existingCategories.length > 0) {
      return NextResponse.json(
        { error: "Name already registered" },
        { status: 409 }
      );
    }

    await sql`
        UPDATE categories
        SET name = ${name}
        WHERE id = ${id}
      `;

    return NextResponse.json({ message: "Category updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/categories/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ❌ Delete data
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM categories WHERE id = ${id}`;
    return NextResponse.json({ message: "Category deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/categories/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
