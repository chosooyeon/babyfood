import { NextResponse, type NextRequest } from "next/server";
import { SAMPLE_BY_ID } from "@/data/samples";
import { recordClick } from "@/lib/track";

export const dynamic = "force-dynamic";

/**
 * 체험팩 링크 중계 — /go/bebecook 을 열면 클릭 한 줄을 남기고 공식 홈으로 보낸다.
 * 화면의 "사이트 열기"와 캘린더 알림(?src=cal)의 링크가 다 여기를 거친다.
 * 기록은 after() 로 응답 뒤에 쓰므로 사용자는 바로 넘어간다. 없는 브랜드면 404.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const b = SAMPLE_BY_ID.get(brand);
  if (!b) return new NextResponse("없는 브랜드예요", { status: 404 });

  await recordClick(b.id, req.nextUrl.searchParams.get("src") === "cal" ? "cal" : "samples");
  return NextResponse.redirect(b.url, { status: 302, headers: { "cache-control": "no-store" } });
}
