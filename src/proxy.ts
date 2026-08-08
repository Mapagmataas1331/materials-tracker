import { NextResponse } from "next/server";

import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/icon.svg"];

/**
 * Next.js 16 renamed the "middleware" file convention to "proxy" and it now
 * always runs on the Node.js runtime (never Edge) — which conveniently
 * means this file, and the Auth.js config it pulls in, can use regular
 * Node.js dependencies (pg, @node-rs/argon2) without any Edge-compatibility
 * workarounds.
 *
 * This check is only a fast, optimistic redirect for UX (no session ->
 * bounce to /login before rendering anything). It is NOT the real security
 * boundary — every Server Component/Server Action re-verifies the user via
 * requireUser()/requireAdmin() against the database (see
 * src/lib/current-user.ts), so a gap in the matcher below can never expose
 * data, only produce a worse redirect experience.
 */
function buildCsp(nonce: string) {
  // Self-hosted, single-origin app with no third-party scripts/embeds — the
  // policy can afford to be strict. 'unsafe-inline' is kept only for
  // style-src because Base UI/Tailwind occasionally set inline style
  // attributes for positioning popovers/tooltips; every <script> instead
  // relies on the per-request nonce below (Next.js automatically stamps
  // this nonce onto the scripts it renders once it sees the header).
  //
  // React's development build uses eval() for stack reconstruction; allow
  // it only outside production so the CSP stays tight in real deploys.
  const scriptSrc =
    process.env.NODE_ENV === "production"
      ? `script-src 'self' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", buildCsp(nonce));

  if (!isPublic && !req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
