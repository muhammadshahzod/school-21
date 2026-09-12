import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Render (unlike Vercel) isn't auto-detected as a trusted host, so
  // NextAuth otherwise throws UntrustedHost and shows a generic
  // "server configuration" error on every request.
  trustHost: true,
  // Render terminates TLS at its edge and forwards to the app over plain
  // HTTP, so Auth.js can't auto-detect the connection as secure. Without
  // this, the PKCE/state cookies get set and read under different names
  // (secure vs non-secure), which fails to parse on callback.
  useSecureCookies: process.env.NODE_ENV === "production",
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      return !!existingUser;
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        try {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { lastActiveAt: new Date() },
          });
        } catch {
          // Presence tracking is best-effort; never block the session on it.
        }
      }
      return session;
    },
  },
});
