import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/prisma/prismaClient";
import { loginSchema } from "./Schema";

export const authOptions: NextAuthOptions = {
  // pages: {
  //   signIn: "/login",
  // },
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //       maxAge: 24 * 60 * 60, // Adjust cookie max age here
  //     },
  //   },
  // },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours for session expiry (cookie will follow this setting)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours maxAge for JWT specifically
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      // async authorize(credentials, req) {
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Enter the Credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Password not set for this user");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            const { id, email, name, number, role } = user;

            return {
              id,
              email,
              name,
              number: number ?? undefined,
              role,
            };
          } else {
            throw new Error("Incoorect Email or Password");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("An unknown error occurred");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        try {
          // Validate required fields
          loginSchema.parse({
            name: user.name,
            email: user.email,
            image: user.image,
          });

          // Use `upsert` to handle creation or no action if user exists
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {},
            create: {
              name: user.name!,
              email: user.email!,
              image: user.image,
            },
          });

          console.log("User sign-in or creation handled successfully:", user);
        } catch (error) {
          console.error("Error signing in user:", error);
          return false; // Return `false` on validation or database error
        }
      }

      return true;
    },
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id?.toString();
        token.email = user.email;
        token.name = user.name;
        token.number = user.number;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string | undefined;
      session.user.number = token.number as string | undefined;
      session.user.role = token.role as string | undefined;

      return session;
    },
  },
};
