import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/agendamentos",
  "/perfil",
  "/checkout",
  "/victoria",
  "/admin",
  "/meus-agendamentos",
  "/agendamento-confirmado",
];

const adminPrefixes = ["/victoria", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  // Auth.js v5 session cookie
  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For admin routes, role check is handled server-side (JWT not available in edge)
  const isAdmin = adminPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isAdmin) {
    // Role check delegated to server components — middleware just ensures auth
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
