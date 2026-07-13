import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  // On non-standard ports (e.g. 3001), NextAuth changes the cookie name.
  // We must pass secureCookie: false for HTTP localhost and try both cookie names.
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false,
    cookieName: "next-auth.session-token",
  });

  // Not logged in
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Not admin
  if (token.role?.toLowerCase() !== "admin") {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
