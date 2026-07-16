import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false,
    cookieName: "next-auth.session-token",
  });

  const { pathname } = request.nextUrl;
  const isExpired = token?.accessTokenExpires && Date.now() > (token.accessTokenExpires as number);

  // 1. If not authenticated or token is expired, redirect to /login
  if (!token || token.error === "AccessTokenExpired" || isExpired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based authorization for /admin routes
  if (pathname.startsWith("/admin")) {
    if (token.role?.toLowerCase() !== "admin") {
      // Redirect customers to /dashboard, and others to home /
      const targetUrl = token.role?.toLowerCase() === "customer" ? "/dashboard" : "/";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
