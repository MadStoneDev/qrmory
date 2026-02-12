import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

// Cache domain lookups for 5 minutes
const DOMAIN_CACHE_TTL = 300;

// Main QRmory domains (requests from these are handled normally)
const MAIN_DOMAINS = [
  "qrmory.com",
  "www.qrmory.com",
  "localhost",
  "localhost:3000",
  "localhost:3020",
];

// Check if this is a custom domain request
function isCustomDomain(host: string): boolean {
  const normalizedHost = host.toLowerCase().replace(/:\d+$/, ""); // Remove port
  return !MAIN_DOMAINS.some(
    (d) => normalizedHost === d || normalizedHost.endsWith(`.${d}`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Handle custom domain requests
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  if (isCustomDomain(host)) {
    // This is a custom domain request
    // Check if it's a shortcode path (single segment, no special routes)
    const pathSegments = pathname.split("/").filter(Boolean);

    if (pathSegments.length === 1) {
      const potentialShortcode = pathSegments[0];

      // Skip if it looks like a special route or file
      if (
        !potentialShortcode.includes(".") &&
        !["api", "dashboard", "login", "signup", "_next"].includes(potentialShortcode)
      ) {
        // Verify this custom domain is registered and active (with Redis cache)
        try {
          const normalizedDomain = host.toLowerCase().replace(/:\d+$/, "");
          const cacheKey = `domain:${normalizedDomain}`;

          // Check cache first
          let domain: { id: string; is_active: boolean } | null = null;
          try {
            const cached = await redis.get<{ id: string; is_active: boolean }>(cacheKey);
            if (cached) {
              domain = cached;
            }
          } catch {
            // Redis failure — fall through to DB lookup
          }

          if (!domain) {
            const { data: dbDomain } = await supabase
              .from("custom_domains")
              .select("id, is_active")
              .eq("domain", normalizedDomain)
              .single();

            domain = dbDomain;

            // Cache the result (even null to prevent repeated DB misses)
            try {
              await redis.setex(
                cacheKey,
                DOMAIN_CACHE_TTL,
                domain || { id: "", is_active: false }
              );
            } catch {
              // Cache write failure is non-critical
            }
          }

          if (domain && domain.is_active) {
            // Domain is valid, let the request pass through to the [code] route
            // The [code] route will handle the actual redirect
            // Add a header to indicate this is a custom domain request
            const response = NextResponse.next({ request });
            response.headers.set("x-custom-domain", host);
            response.headers.set("x-custom-domain-id", domain.id);

            // Copy cookies from supabaseResponse
            supabaseResponse.cookies.getAll().forEach((cookie) => {
              response.cookies.set(cookie.name, cookie.value);
            });

            return response;
          }
        } catch (error) {
          // Domain lookup failed, continue with normal handling
          console.error("Custom domain lookup error:", error);
        }
      }
    }
  }

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/login")) {
    // user is logged in going to /login, respond by redirecting the user to the dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
