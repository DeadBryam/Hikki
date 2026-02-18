import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/chat", "/notes"];
const PUBLIC_ROUTES = ["/auth"];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  if (token && isPublicAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (!token && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}
