import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const roles = await sql`
            SELECT  * FROM roles
            WHERE id = ${id} LIMIT 1
          `;

    if (roles.length === 0) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(roles[0]);
  } catch (err) {
    console.error("🔥 ERROR GET /api/roles/[id]:", err);
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

    const existingRoles = await sql`
      SELECT id FROM roles WHERE name = ${name} AND id != ${id} LIMIT 1
    `;

    if (existingRoles.length > 0) {
      return NextResponse.json(
        { error: "Name already registered" },
        { status: 409 }
      );
    }

    await sql`
        UPDATE roles
        SET name = ${name}
        WHERE id = ${id}
      `;

    return NextResponse.json({ message: "Role updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/roles/[id]:", err);
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
    await sql`DELETE FROM roles WHERE id = ${id}`;
    return NextResponse.json({ message: "Role deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/roles/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
