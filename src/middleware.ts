import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/client";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public Routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/help",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookies-policy",
    "/error",
  ];

  // Skip for static files and API routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Skip for public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

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
