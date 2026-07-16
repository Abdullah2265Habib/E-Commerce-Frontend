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

  console.log(token);
  

  const isExpired = token?.accessTokenExpires && Date.now() > (token.accessTokenExpires as number);

  if (!token || token.error === "AccessTokenExpired" || isExpired) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token.role?.toLowerCase() !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
