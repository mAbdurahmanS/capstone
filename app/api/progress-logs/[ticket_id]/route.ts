import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/encrypt";

// 📄 Get progress logs by ticket_id and user_id
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ ticket_id: number }>;
  }
) {
  const { ticket_id } = await params;

  try {
    const rows = await sql`
      SELECT 
        p.id,
        p.note,
        p.ticket_id, 
        t.title,
        p.user_id,
        p.created_at,
        u.name AS user,
        i.image AS image,
        r.name AS role
      FROM progress_logs p
      LEFT JOIN tickets t ON p.ticket_id = t.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN images i ON p.id = i.progress_log_id
      WHERE p.ticket_id = ${ticket_id}
      ORDER BY p.created_at ASC
    `;

    if (rows.length === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    const progressLogs = rows.map((row) => {
      return {
        id: row.id,
        note: decrypt(row.note),
        image: row.image,
        ticket_id: {
          id: row.ticket_id,
          // title: row.title,
        },
        user: {
          id: row.user_id,
          name: row.user,
          role: row.role,
        },
        created_at: row.created_at,
      };
    });

    return NextResponse.json(progressLogs);
  } catch (err) {
    console.error(
      "🔥 ERROR GET /api/progress-logs/[ticket_id]/[user_id]:",
      err
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
