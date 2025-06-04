import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await verifyToken(token);
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
