import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/client";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect dashboard routes
  const protectedRoutes = ["/dashboard"];

  // Auth routes that logged-in users shouldn't access
  const authRoutes = ["/login", "/register"];

  // Skip for static files and API routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication status for all routes
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const isLoggedIn = !!data?.user;

    // Check if the current path is a protected route or a sub-route of a protected route
    const isProtectedRoute = protectedRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    );

    // If user is logged in and trying to access auth routes, redirect to dashboard
    if (isLoggedIn && authRoutes.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user is not logged in and trying to access protected routes, redirect to login
    if (!isLoggedIn && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For all other cases, update the session and proceed
    return await updateSession(request);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
