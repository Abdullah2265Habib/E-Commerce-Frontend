import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          )
          //http://localhost:3001/api/auth/session
          //http://localhost:3001/api/auth/providers
          const user = await response.json()

          if (!response.ok || !user) {
            return null
          }

          // Return the user object — NextAuth will store it in the session/token
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 1. When user logs in, save their data into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    // 2. When session is accessed, copy token data into session.user
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name
        session.user.email = token.email as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
