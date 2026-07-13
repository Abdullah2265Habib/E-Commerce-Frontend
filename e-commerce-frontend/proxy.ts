import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;

    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/src/app/admin/:path*",
  ],
};