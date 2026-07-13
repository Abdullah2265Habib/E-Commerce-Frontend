// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      email: string;
    } & DefaultSession["user"];
    accessToken?: string | null;
    refreshToken?: string | null;
  }

  interface User {
    id: string;
    role: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpires?: number;
  }
}
