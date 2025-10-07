import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value || null;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/register"];

  // Kalau belum login dan akses private page
  if (!token && !publicPaths.includes(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Kalau sudah login dan akses /login atau root (/)
  if (token && (pathname === "/login" || pathname === "/")) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/results/:path*",
    "/candidates/:path*",
    "/questions-bank/:path*",
    "/test-packages/:path*",
    "/test-distribution/:path*",
    "/user-management/:path*",
    "/logs/:path*",
  ],
};
