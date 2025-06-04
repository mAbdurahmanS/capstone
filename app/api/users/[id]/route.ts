import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// 📄 Get user by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params;
  try {
    const rows = await sql`
            SELECT 
              u.id, u.name, u.email, u.role_id, u.department_id,
              r.name AS role,
              d.name AS department
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ${id} LIMIT 1
          `;

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: {
        id: rows[0].role_id,
        name: rows[0].role,
      },
      department: {
        id: rows[0].department_id,
        name: rows[0].department,
      },
    };

    return NextResponse.json(user);
  } catch (err) {
    console.error("🔥 ERROR GET /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔄 Update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const data = await req.json();
    const { id } = await params; // wajib await params
    const { name, email, password, role, department } = data;

    // Cek apakah email sudah dipakai user lain (bukan user dengan id ini)
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${id} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered by another user" },
        { status: 409 }
      );
    }

    // Encrypt password hanya kalau password ada dan bukan kosong (opsional)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Build update query dengan password opsional
    if (hashedPassword) {
      await sql`
        UPDATE users
        SET name = ${name},
            email = ${email},
            password = ${hashedPassword},
            role_id = ${role},
            department_id = ${department},
            updated_at = now()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE users
        SET name = ${name},
            email = ${email},
            role_id = ${role},
            department_id = ${department},
            updated_at = now()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ message: "User updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ❌ Delete user
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${id}`;
    return NextResponse.json({ message: "User deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/users/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
