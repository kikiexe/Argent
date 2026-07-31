import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const url = new URL(request.url);

  // Define route rules
  const isAuthRequiredRoute = 
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/categories") ||
    url.pathname.startsWith("/transactions");

  const isGuestOnlyRoute = url.pathname === "/login";

  // 1. If not logged in and requesting auth page -> redirect to /login
  if (!user && isAuthRequiredRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // 2. If logged in and requesting guest page -> redirect to /dashboard
  if (user && isGuestOnlyRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
