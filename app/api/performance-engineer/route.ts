import sql from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`
        SELECT
          e.id,
          e.name,
          COUNT(t.id) AS assigned,
          COUNT(t.resolved_at) AS resolved,
          ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.assigned_at)) / 3600), 1) || 'h' AS avgtime,
          ROUND(COUNT(t.resolved_at) * 100.0 / NULLIF(COUNT(t.id), 0)) AS efficiency
        FROM users e
        LEFT JOIN tickets t ON t.engineer_id = e.id
        WHERE e.role_id = 2
        GROUP BY e.id, e.name
        ORDER BY e.name;
      `;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      resolved: Number(row.resolved),
      avgTime: row.avgtime,
      efficiency: Number(row.efficiency),
      assigned: Number(row.assigned),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("🔥 ERROR GET /api/performances:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
