import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    // For dashboard routes, apply full auth check with redirects
    return await updateSession(request);
  }

  // For all other routes, just refresh the session but don't redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include all routes except static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
