import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/scan", "/analysis", "/reminders", "/kids", "/onboarding", "/profile"];
const AUTH_ROUTES = ["/auth"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("cynex_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthPage  = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Not logged in → redirect to login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("mode", "login");
    return NextResponse.redirect(url);
  }

  // Already logged in → redirect away from auth page
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
};
