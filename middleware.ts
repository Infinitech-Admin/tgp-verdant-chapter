// middleware.ts (root level)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  console.log("Middleware:", { pathname, hasToken: !!token });

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/cookies",
    "/terms",
    "/privacy",
  ];
  const isPublicPath = publicPaths.includes(pathname);

  const isApiRoute = pathname.startsWith("/api/");

  const isPWAFile =
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/swe-worker-");

  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|json|js)$/);

  if (isApiRoute || isPublicAsset || isPWAFile) {
    return NextResponse.next();
  }

  // No token on protected route → redirect to login
  if (!token && !isPublicPath) {
    console.log("Middleware: No token, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token on login/register → redirect away
  if (token && (pathname === "/login" || pathname === "/register")) {
    console.log("Middleware: User has token on login/register, redirecting...");
    const redirectTo = request.nextUrl.searchParams.get("redirect");

    if (
      redirectTo &&
      !redirectTo.startsWith("/login") &&
      !redirectTo.startsWith("/register")
    ) {
      console.log("Middleware: Redirecting to specified path:", redirectTo);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    console.log("Middleware: Redirecting to home page");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|swe-worker-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
