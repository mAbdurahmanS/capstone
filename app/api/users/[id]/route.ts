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
              u.id, u.name, u.email, u.role_id, u.department_id, u.company,
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
      company: rows[0].company,
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
    const { id } = await params; // pastikan ID angka

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Validasi email jika ada
    if (data.email) {
      const existing = await sql`
        SELECT id FROM users WHERE email = ${data.email} AND id != ${id} LIMIT 1
      `;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Email already registered by another user" },
          { status: 409 }
        );
      }
    }

    // Persiapkan kolom yang akan diupdate
    const fields: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];

    if (data.name) {
      fields.push(`name = $${fields.length + 1}`);
      values.push(data.name);
    }

    if (data.email) {
      fields.push(`email = $${fields.length + 1}`);
      values.push(data.email);
    }

    if (data.company) {
      fields.push(`company = $${fields.length + 1}`);
      values.push(data.company);
    }

    if (data.role) {
      fields.push(`role_id = $${fields.length + 1}`);
      values.push(data.role);
    }

    if (data.department) {
      fields.push(`department_id = $${fields.length + 1}`);
      values.push(data.department);
    }

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push(`password = $${fields.length + 1}`);
      values.push(hashedPassword);
    }

    fields.push(`updated_at = now()`);

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${
      values.length + 1
    }`;

    await sql.unsafe(query, [...values, id]);

    return NextResponse.json({ message: "User updated successfully" });
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
