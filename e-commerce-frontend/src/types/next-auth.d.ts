// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
    accessToken?: string
    refreshToken?: string
  }

  interface User {
    id: string
    role: string
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accessToken?: string
    refreshToken?: string
  }
}
