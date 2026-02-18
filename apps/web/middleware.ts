import { type NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/chat", "/notes"];
const PUBLIC_ROUTES = ["/auth"];

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Try to get token from cookies (server-side)
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for root path redirects
  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  // If user is authenticated and tries to access auth pages, redirect to /chat
  if (token && isPublicAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If no token and accessing protected route, redirect to login
  if (!token && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
