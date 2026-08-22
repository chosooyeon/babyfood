import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, isValidSession } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  if (await isValidSession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // 로그인 화면·정적 파일·PWA 아이콘은 잠그지 않는다
  matcher: ["/((?!login|_next/static|_next/image|icons|manifest.webmanifest|favicon.ico).*)"],
};
