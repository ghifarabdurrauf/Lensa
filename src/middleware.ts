import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["id", "en", "fr"];

/** Mengarahkan alamat tanpa bahasa (mis. "/jobs") ke versi berbahasa ("/id/jobs"). */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (LOCALES.includes(first)) return NextResponse.next();

  const saved = req.cookies.get("lensa-locale")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const guess = accept.startsWith("fr") ? "fr" : accept.startsWith("en") ? "en" : "id";
  const locale = saved && LOCALES.includes(saved) ? saved : guess;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icon.svg|robots.txt|manifest.webmanifest|.*\\..*).*)"],
};
