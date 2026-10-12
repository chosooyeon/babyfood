import type { NextRequest } from "next/server";
import { ALARM_CHOICES, buildCalendar, DEFAULT_ALARM } from "@/lib/samples";
import { SAMPLE_BY_ID } from "@/data/samples";

/**
 * 아이폰 Safari 에서 열면 "캘린더에 추가" 가 뜨고, webcal:// 로 열면 구독이 된다.
 * 데이터는 코드에서 오므로 누구나 받아도 된다.
 *
 *   ?before=10            오픈 10분 전 알림 (5·10·15·30·60 중 하나, 기본 10)
 *   ?brands=bebecook,jjangjuk   이 브랜드만 (없으면 시간 정해진 브랜드 전부)
 */
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const beforeRaw = Number(q.get("before"));
  const before = (ALARM_CHOICES as readonly number[]).includes(beforeRaw)
    ? beforeRaw
    : DEFAULT_ALARM;
  const brandIds = (q.get("brands") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((id) => SAMPLE_BY_ID.has(id));

  return new Response(buildCalendar(new Date(), { before, brandIds }), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="babyfood-samples.ics"',
      "cache-control": "no-store",
    },
  });
}
