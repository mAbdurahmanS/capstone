import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const departments = await sql`
            SELECT  * FROM departments
            WHERE id = ${id} LIMIT 1
          `;

    if (departments.length === 0) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(departments[0]);
  } catch (err) {
    console.error("🔥 ERROR GET /api/departments/[id]:", err);
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

    const existingDepartments = await sql`
      SELECT id FROM departments WHERE name = ${name} AND id != ${id} LIMIT 1
    `;

    if (existingDepartments.length > 0) {
      return NextResponse.json(
        { error: "Name already registered" },
        { status: 409 }
      );
    }

    await sql`
        UPDATE departments
        SET name = ${name}
        WHERE id = ${id}
      `;

    return NextResponse.json({ message: "Department updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/departments/[id]:", err);
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
    await sql`DELETE FROM departments WHERE id = ${id}`;
    return NextResponse.json({ message: "Department deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/departments/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
