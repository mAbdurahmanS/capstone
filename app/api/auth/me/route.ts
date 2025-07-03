import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await verifyToken(token);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid token ${err}` },
      { status: 401 }
    );
  }
}
