import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/encrypt";

// 📄 Get data by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params;
  try {
    const rows = await sql`
            SELECT 
              t.id,t.title, t.description, t.created_at, t.updated_at, t.assigned_at, t.resolved_at,
              i.image AS image,
              p.id AS priority_id, p.name AS priority_name,
              s.id AS status_id, s.name AS status_name,
              c.id AS customer_id, c.name AS customer_name, c.email AS customer_email,
              e.id AS engineer_id, e.name AS engineer_name, e.email AS engineer_email
            FROM tickets t
            LEFT JOIN priorities p ON t.priority_id = p.id
            LEFT JOIN status s ON t.status_id = s.id
            LEFT JOIN users c ON t.customer_id = c.id
            LEFT JOIN users e ON t.engineer_id = e.id
            LEFT JOIN images i ON t.id = i.ticket_id
            WHERE t.id = ${id} LIMIT 1
          `;

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    const ticket = {
      id: rows[0].id,
      title: rows[0].title,
      description: decrypt(rows[0].description),
      image: rows[0].image,
      priority: {
        id: rows[0].priority_id,
        name: rows[0].priority_name,
      },
      status: {
        id: rows[0].status_id,
        name: rows[0].status_name,
      },
      customer: {
        id: rows[0].customer_id,
        name: rows[0].customer_name,
        email: rows[0].customer_email,
      },
      engineer: rows[0].engineer_id
        ? {
            id: rows[0].engineer_id,
            name: rows[0].engineer_name,
            email: rows[0].engineer_email,
          }
        : null,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      assigned_at: rows[0].assigned_at,
      resolved_at: rows[0].resolved_at,
    };

    return NextResponse.json(ticket);
  } catch (err) {
    console.error("🔥 ERROR GET /api/tickets/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔄 Update data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ticket ID" }, { status: 400 });
    }

    // Field yang diizinkan untuk diupdate
    const allowedFields = [
      "title",
      "description",
      "priority_id",
      "customer_id",
      "engineer_id",
      "status_id",
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldsToUpdate: Record<string, any> = {};

    // Enkripsi description jika ada
    for (const key of allowedFields) {
      if (key in data) {
        fieldsToUpdate[key] =
          key === "description" ? encrypt(data[key]) : data[key];
      }
    }

    // Update assigned_at jika engineer_id dikirim
    if ("engineer_id" in data) {
      fieldsToUpdate["assigned_at"] = new Date();
    }

    // Update resolved_at jika status = 3 atau 4
    if ("status_id" in data && [3, 4].includes(Number(data.status_id))) {
      fieldsToUpdate["resolved_at"] = new Date();
    }

    // Selalu update updated_at
    fieldsToUpdate["updated_at"] = new Date();

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Generate SET clause dinamis
    const setClause = Object.keys(fieldsToUpdate)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);

    await sql.unsafe(
      `UPDATE tickets SET ${setClause} WHERE id = $${values.length + 1}`,
      [...values, id]
    );

    return NextResponse.json({ message: "Ticket updated" });
  } catch (err) {
    console.error("🔥 ERROR PUT /api/tickets/[id]:", err);
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
    await sql`DELETE FROM tickets WHERE id = ${id}`;
    return NextResponse.json({ message: "Ticket deleted" });
  } catch (err) {
    console.error("🔥 ERROR DELETE /api/tickets/[id]:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
