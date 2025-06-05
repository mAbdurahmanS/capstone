// 📄 app/api/users/role/[role_id]/route.ts
import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ role_id: string }> }
) {
  const { role_id } = await context.params;
  const roleId = Number(role_id);

  if (isNaN(roleId)) {
    return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT 
        u.id, u.name, u.email, u.role_id, u.department_id, u.created_at, u.company,
        r.name AS role,
        d.name AS department
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role_id = ${roleId}
      ORDER BY u.created_at DESC
    `;

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      role: {
        id: row.role_id,
        name: row.role,
      },
      department: {
        id: row.department_id,
        name: row.department,
      },
      created_at: row.created_at,
    }));

    return NextResponse.json(users);
  } catch (err) {
    console.error("🔥 ERROR GET /api/users/role/[role_id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
