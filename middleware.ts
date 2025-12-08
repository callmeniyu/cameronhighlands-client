import { NextRequest, NextResponse } from "next/server";

// List of known top-level routes that should be allowed to pass through
const ALLOWED_PREFIXES = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/static",
  "/assets",
  "/public",
  "/sitemap.xml",
  "/robots.txt",
  "/faqs",
  "/tours",
  "/transfers",
  "/booking",
  "/bookings",
  "/payment",
  "/login",
  "/admin",
  "/contact-us",
  "/privacy-policy",
  "/terms",
  "/blog",
  "/blogs",
  "/news",
  "/uploads",
  "/auth",
  "/profile",
  "/cart",
  "/recommendations",
  "/user-info",
  "/confirmation",
];

// Additional explicitly allowed exact paths
const ALLOWED_EXACT = [
  "/",
];

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl.clone();
    const { pathname } = url;

    // Handle specific /service-page/* redirects first
    if (pathname === "/service-page/oastel-trip-nap") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    
    if (pathname === "/service-page/private-guided-mossy-forest-highlands-day-trip") {
      url.pathname = "/tours/private-full-day-highlands-mossy-forest-discovery";
      return NextResponse.redirect(url);
    }
    
    if (pathname === "/service-page/full-day-private-land-rover-tour-your-own-group") {
      url.pathname = "/tours/mossy-forest-full-day-highland-discovery";
      return NextResponse.redirect(url);
    }
    
    if (pathname === "/service-page/private-highland-escape") {
      url.pathname = "/tours/private-full-day-highlands-mossy-forest-discovery";
      return NextResponse.redirect(url);
    }
    
    if (pathname === "/service-page/half-day-land-rover-tour-to-mossy-forest") {
      url.pathname = "/tours/half-day-mossy-forest-land-rover-trip";
      return NextResponse.redirect(url);
    }

    // Also handle legacy slugs that we added as redirects in next.config.ts
    if (pathname === "/service-page/full-day-coral-hill-private-tour") {
      url.pathname = "/tours/full-day-coral-mossy-forest-hill-private-tour";
      return NextResponse.redirect(url);
    }

    if (pathname === "/tours/mossy-forest-highland-discovery") {
      url.pathname = "/tours/mossy-forest-full-day-highland-discovery";
      return NextResponse.redirect(url);
    }

    if (pathname === "/service-page/full-day-land-rover-road-trip-co-tour") {
      url.pathname = "/tours/mossy-forest-full-day-highland-discovery";
      return NextResponse.redirect(url);
    }

    // Allow if path is exactly allowed
    if (ALLOWED_EXACT.includes(pathname)) {
      return NextResponse.next();
    }

    // Allow if the pathname starts with any allowed prefix (assets, api, next internals)
    for (const prefix of ALLOWED_PREFIXES) {
      if (pathname.startsWith(prefix)) {
        return NextResponse.next();
      }
    }

    // Allow files with extensions (images, css, js, etc.)
    if (pathname.includes('.')) {
      return NextResponse.next();
    }

    // Allow dynamic routes that might exist
    if (pathname.match(/^\/[^\/]+\/.*/)) {
      return NextResponse.next();
    }

    // If we reach here, the route is unknown — redirect to homepage immediately
    url.pathname = "/";
    return NextResponse.redirect(url);
  } catch (error) {
    // If middleware fails, just continue to the page
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
