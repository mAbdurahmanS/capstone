import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utils/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // skip static & api dll
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      await verifyToken(token);
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (err) {
      console.error("Invalid token", err);
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}
