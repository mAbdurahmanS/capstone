import sql from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/encrypt";

// 📄 Get all data
// export async function GET() {
//   try {
//     const rows = await sql`
//       SELECT
//         p.note, p.ticket_id
//         u.name AS User,
//       FROM progress_logs p
//       LEFT JOIN tickets t ON p.ticket_id = t.id
//       LEFT JOIN users u ON p.user_id = u.id
//     `;

//     // Decrypt field description
//     const progress_logs = rows.map((row) => ({
//       ...row,
//       note: decrypt(row.note),
//     }));

//     return NextResponse.json(progress_logs);
//   } catch (err) {
//     console.error("🔥 ERROR GET /api/progress_logs:", err);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// ➕ Create new data
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { note, ticket_id, user_id } = data;

    // ✅ Validasi satu per satu
    if (!note) {
      return NextResponse.json({ error: "Note is required" }, { status: 400 });
    }

    if (!ticket_id) {
      return NextResponse.json(
        { error: "Tiket ID is required" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 🔐 Enkripsi note
    const encryptedNote = encrypt(note);

    await sql`
      INSERT INTO progress_logs (
        note, ticket_id, user_id
      ) VALUES (
        ${encryptedNote}, ${ticket_id}, ${user_id}
      )
    `;

    return NextResponse.json({ message: "Note created" });
  } catch (err) {
    console.error("🔥 ERROR POST /api/progress_logs:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
