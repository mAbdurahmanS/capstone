import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utils/jwt";

type User = {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isLoginPage = pathname === "/";
  // const isRegisterPage = pathname === "/";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      const user = (await verifyToken(token)) as User; // { id: number, ... }

      // Jika sudah login dan coba ke /, redirect ke dashboard
      if (isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      const adminOnlyPaths = [
        "/dashboard/admin",
        "/dashboard/engineer",
        "/dashboard/user",
      ];
      const isAdminOnlyPage = adminOnlyPaths.some((path) =>
        pathname.startsWith(path)
      );

      if (isAdminOnlyPage && user.role.id !== 1) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // 🔒 Rule: user ID 3 hanya bisa ke /ticket
      if (user.role.id === 3 && !pathname.startsWith("/ticket")) {
        return NextResponse.redirect(new URL("/ticket", request.url));
      }

      // 🔒 Rule: user ID 1 dan 2 hanya bisa ke /dashboard
      if (
        (user.role.id === 1 || user.role.id === 2) &&
        pathname.startsWith("/ticket")
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (err) {
      console.error("Invalid token", err);
      const res = NextResponse.redirect(new URL("/", request.url));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ticket", "/dashboard/:path*", "/"],
};
