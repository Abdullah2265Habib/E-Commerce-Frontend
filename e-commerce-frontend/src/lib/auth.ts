import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
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
          return null;
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
            },
          );

          const data = await response.json();

          if (!response.ok || !data?.user) {
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;

        token.accessToken = (user as any).accessToken;
        const decoded: any = jwtDecode(
          (user as any).accessToken
        );
        token.accessTokenExpires = decoded.exp * 1000

        return token;
      }

      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
        token.accessToken = null;
        token.error = "AccessTokenExpired";
        return token;
      }

      return token;
    },
    //   if (user) {
    //     token.id = user.id;
    //     token.name = user.name;
    //     token.email = user.email;
    //     token.role = user.role;
    //     token.accessToken = (user as any).accessToken;
    //     token.refreshToken = (user as any).refreshToken;
    //     return token;
    //   }

    //   // Try to refresh the access token if it has expired
    //   if (token.refreshToken) {
    //     try {
    //       const res = await fetch(
    //         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`,
    //         {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({ refresh_token: token.refreshToken }),
    //         },
    //       );

    //       if (res.ok) {
    //         const refreshed = await res.json();
    //         token.accessToken = refreshed.access_token;
    //         if (refreshed.refresh_token) {
    //           token.refreshToken = refreshed.refresh_token;
    //         }
    //       } else {
    //         token.accessToken = null;
    //         token.refreshToken = null;
    //       }
    //     } catch {
    //       token.accessToken = null;
    //       token.refreshToken = null;
    //     }
    //   }

    //   return token;
    // },
    // 2. When session is accessed, copy token data into session.user
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
        };

        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
