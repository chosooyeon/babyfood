import { NextResponse, type NextRequest } from "next/server";
import { HH_COOKIE, HH_HEADER, HH_MAX_AGE, isHouseholdCode, newHouseholdCode } from "@/lib/household-code";

/**
 * 처음 온 기기에 수첩 코드 쿠키를 심는다. 이 코드가 "내 아기 기록"의 범위다.
 * 쿠키가 이미 있으면 아무것도 안 한다 (클라이언트가 보낸 x-bf-hh 헤더만 지운다).
 */
export default function proxy(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(HH_HEADER);

  const current = req.cookies.get(HH_COOKIE)?.value;
  if (isHouseholdCode(current)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const code = newHouseholdCode();
  requestHeaders.set(HH_HEADER, code);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.cookies.set({
    name: HH_COOKIE,
    value: code,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: HH_MAX_AGE,
    path: "/",
  });
  return res;
}

export const config = {
  // 정적 파일·아이콘·소개 카드·cron 은 수첩 코드가 필요 없다
  matcher: ["/((?!_next/static|_next/image|icons|guide|api|manifest.webmanifest|favicon.ico).*)"],
};
