import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const status = await sql`
            SELECT  * FROM status
            WHERE id = ${id} LIMIT 1
          `;

    if (status.length === 0) {
      return NextResponse.json(
        { message: "Status not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(status[0]);
  } catch (err) {
    console.error("🔥 ERROR GET /api/status/[id]:", err);
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

    const existingStatus = await sql`
      SELECT id FROM status WHERE name = ${name} AND id != ${id} LIMIT 1
    `;

    if (existingStatus.length > 0) {
      return NextResponse.json(
        { error: "Name already registered" },
        { status: 409 }
      );
    }

    await sql`
        UPDATE status
        SET name = ${name}
        WHERE id = ${id}
      `;

    return NextResponse.json({ message: "Status updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/status/[id]:", err);
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
    await sql`DELETE FROM status WHERE id = ${id}`;
    return NextResponse.json({ message: "Status deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/status/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
