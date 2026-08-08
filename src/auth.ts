import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { isRateLimited } from "@/lib/rate-limit";
import { findUserById, verifyCredentials } from "@/server/services/users";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    // JWT (not database) sessions: cheap to verify in middleware on every
    // request. Real-time enforcement of "user disabled" still happens
    // because the `session` callback below re-reads the user row from
    // Postgres on every server-rendered page / server action, which is
    // where all real authorization decisions are made — the middleware
    // check is only a fast redirect-to-login convenience, never the sole
    // gate (see src/lib/current-user.ts).
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours — internal tool, short-lived is safer
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        login: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const login = credentials?.login;
        const password = credentials?.password;
        if (typeof login !== "string" || typeof password !== "string") {
          return null;
        }

        // Brute-force protection (ТЗ п.13): after too many failed attempts
        // for a given login within the window, stop even trying the
        // database/hash check. Keyed by login (not IP) so it works
        // correctly behind any reverse proxy configuration.
        if (isRateLimited(`login:${login.trim().toLowerCase()}`, LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_WINDOW_MS)) {
          return null;
        }

        const user = await verifyCredentials(login, password);
        if (!user) return null;

        return {
          id: user.id,
          name: user.fullName,
          login: user.login,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string;
        token.role = (user as { role: "admin" | "user" }).role;
        token.login = (user as { login: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      if (!uid) {
        session.user = undefined as unknown as typeof session.user;
        return session;
      }

      // Re-validate against the database on every session read so a
      // disabled account (or deleted role change) takes effect on the
      // user's very next page load, not only after the JWT expires.
      const dbUser = await findUserById(uid);
      if (!dbUser || !dbUser.isActive) {
        session.user = undefined as unknown as typeof session.user;
        return session;
      }

      session.user = {
        id: dbUser.id,
        name: dbUser.fullName,
        login: dbUser.login,
        role: dbUser.role,
      } as typeof session.user;
      return session;
    },
  },
  trustHost: true,
});
