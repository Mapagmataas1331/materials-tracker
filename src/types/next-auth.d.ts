import type { DefaultSession } from "next-auth";

export type AppRole = "admin" | "user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      login: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    login: string;
    role: AppRole;
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    login?: string;
    role?: AppRole;
    sessionVersion?: number;
  }
}
