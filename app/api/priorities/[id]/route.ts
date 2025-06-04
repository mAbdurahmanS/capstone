import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const priorities = await sql`
            SELECT  * FROM priorities
            WHERE id = ${id} LIMIT 1
          `;

    if (priorities.length === 0) {
      return NextResponse.json(
        { message: "Priority not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(priorities[0]);
  } catch (err) {
    console.error("🔥 ERROR GET /api/priorities/[id]:", err);
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

    const existingPriorities = await sql`
      SELECT id FROM priorities WHERE name = ${name} AND id != ${id} LIMIT 1
    `;

    if (existingPriorities.length > 0) {
      return NextResponse.json(
        { error: "Name already registered" },
        { status: 409 }
      );
    }

    await sql`
        UPDATE priorities
        SET name = ${name}
        WHERE id = ${id}
      `;

    return NextResponse.json({ message: "Priority updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/priorities/[id]:", err);
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
    await sql`DELETE FROM priorities WHERE id = ${id}`;
    return NextResponse.json({ message: "Priority deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/priorities/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
