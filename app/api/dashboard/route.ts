import sql from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [row] = await sql`
      SELECT
        SUM(CASE WHEN s.name ILIKE 'Open'    THEN 1 ELSE 0 END)  AS open,
        SUM(CASE WHEN s.name ILIKE 'Pending' THEN 1 ELSE 0 END)  AS pending,
        SUM(CASE WHEN t.resolved_at IS NOT NULL                 THEN 1 ELSE 0 END)  AS solved,
        SUM(CASE WHEN t.engineer_id IS NULL                     THEN 1 ELSE 0 END)  AS unassigned
      FROM tickets t
      LEFT JOIN status s ON t.status_id = s.id;
    `;

    /* hasil row: { open: 12, pending: 7, solved: 45, unassigned: 3 } */
    return NextResponse.json({
      open: Number(row.open),
      pending: Number(row.pending),
      solved: Number(row.solved),
      unassigned: Number(row.unassigned),
    });
  } catch (err) {
    console.error("🔥 ERROR GET /api/dashboard/summary:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
