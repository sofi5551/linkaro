import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/api/auth/login",
  "/api/auth/logout",
  "/privacy-policy",
  "/terms-of-services",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/mobile/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.otf$|.*\\.ttf$).*)"],
};
