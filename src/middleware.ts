import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public routes that don't need auth
  const publicPaths = [
    "/",
    "/login",
    "/sign-up",
    "/auth/login",
    "/auth/sign-up",
    "/auth/check-email",
    "/auth/confirm",
    "/auth/reset-password",
    "/error",
  ];

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      path === publicPath ||
      path.startsWith("/_next") ||
      path.startsWith("/api"),
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    const supabase = await createClient();

    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
