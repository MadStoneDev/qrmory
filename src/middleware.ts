import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/client";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Static Public Routes (exact matches)
  const staticPublicRoutes = [
    "/",
    "/coupon",
    "/vcard",
    "/help",
    "/help/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookies-policy",
    "/error",
  ];

  // Authentication related routes that should be public
  const authRoutes = [
    "/auth/check-email",
    "/auth/reset-password",
    "/auth/confirm",
    "/auth/login",
    "/auth/sign-up",
  ];

  // Dynamic Public Routes (path prefixes)
  const dynamicPublicRoutes = ["/coupon/", "/vcard/", "/_next/", "/api/"];

  // Assets and static files
  if (path.includes(".")) {
    return NextResponse.next();
  }

  // Check if static public route
  if (staticPublicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if it's an auth route
  if (
    authRoutes.includes(path) ||
    authRoutes.some((route) => path.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Check if dynamic public route
  if (dynamicPublicRoutes.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (!data || !data.user) {
      console.log(
        `No authenticated user found, redirecting from ${path} to /login`,
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error:", error);
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
