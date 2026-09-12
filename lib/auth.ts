import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ensureSchema, pool } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Login", type: "text" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!username || !password) return null;

        await ensureSchema();
        const { rows } = await pool.query(
          `SELECT id, name, image, password FROM app_users WHERE lower(username) = $1`,
          [username]
        );
        const user = rows[0];
        if (!user || user.password !== password) return null;

        return { id: user.id, name: user.name, image: user.image || null };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        try {
          await ensureSchema();
          await pool.query(
            `UPDATE app_users SET last_active_at = now() WHERE id = $1`,
            [token.id]
          );
        } catch {
          // Presence tracking is best-effort; never block the session on it.
        }
      }
      return session;
    },
  },
});
