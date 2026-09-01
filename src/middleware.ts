import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/",
  "/person",
  "/barrio",
  "/users",
  "/role",
  "/actions",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(route))
  );

  if (isProtected) {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decodedStr = Buffer.from(token, "base64").toString("utf-8");
      const session = JSON.parse(decodedStr);

      if (!session.expiresAt || Date.now() > session.expiresAt) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("expired", "1");
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("session_token");
        return response;
      }
    } catch (err) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("expired", "1");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled individually or through auth middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
