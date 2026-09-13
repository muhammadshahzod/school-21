import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

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
      // Auth.js copies the full avatar (a base64 data: URI, up to 2MB) into
      // token.picture by default. The app never reads session.user.image —
      // it always fetches the current avatar via /api/users/me — so drop it
      // here, otherwise the encrypted JWT cookie can exceed header size
      // limits (HTTP 431) for any user with an uploaded profile picture.
      delete token.picture;
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
