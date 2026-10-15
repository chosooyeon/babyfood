import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Screen from "@/components/Screen";
import { Card, SectionTitle } from "@/components/ui";
import FeedChart from "@/components/FeedChart";
import FeedList from "@/components/FeedList";
import { getBottlesBetween, getMealsBetween } from "@/lib/queries";
import { addDays, parseDate, today } from "@/lib/stage";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

/** 한 집의 기록만 보이는 화면 — 검색에 나올 이유가 없다 */
export const metadata: Metadata = {
  title: "먹인 것",
  robots: { index: false, follow: true },
};

const DAYS = 7;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 먹인 것 탭 — 베이비타임처럼 하루가 세로줄 하나인 7일 차트가 크게, 아래에 고른 날의 목록.
 *   ?end=YYYY-MM-DD  차트 오른쪽 끝 날짜 (기본 오늘). ‹ › 로 일주일씩
 *   ?d=YYYY-MM-DD    고른 날 (기본 end)
 */
export default async function FeedsPage({ searchParams }: { searchParams: Promise<{ end?: string; d?: string }> }) {
  await track("/feeds");
  const sp = await searchParams;
  const now = today();
  const end = sp.end && YMD.test(sp.end) && sp.end <= now ? sp.end : now;
  const from = addDays(end, -(DAYS - 1));
  const days = Array.from({ length: DAYS }, (_, i) => addDays(from, i));
  const selected = sp.d && YMD.test(sp.d) && days.includes(sp.d) ? sp.d : end;

  const [meals, bottles] = await Promise.all([getMealsBetween(from, end), getBottlesBetween(from, end)]);
  const dayMeals = meals.filter((m) => m.date === selected);
  const dayBottles = bottles.filter((b) => b.date === selected);
  const mealMl = dayMeals.reduce((s, m) => s + (m.amount_ml ?? 0), 0);
  const bottleMl = dayBottles.reduce((s, b) => s + (b.amount_ml ?? 0), 0);
  const sel = parseDate(selected);

  return (
    <Screen title="먹인 것">
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <Link href={`/feeds?end=${addDays(end, -DAYS)}`} className="rounded-full p-1 text-muted" aria-label="지난 일주일">
            <ChevronLeft size={18} />
          </Link>
          <p className="flex items-center gap-3 text-[11px] font-bold text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-peach" /> 이유식
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-sky" /> 분유
            </span>
          </p>
          {end < now ? (
            <Link href={`/feeds?end=${addDays(end, DAYS) > now ? now : addDays(end, DAYS)}`} className="rounded-full p-1 text-muted" aria-label="다음 일주일">
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="p-1 text-line" aria-hidden>
              <ChevronRight size={18} />
            </span>
          )}
        </div>
        <FeedChart days={days} selected={selected} today={now} meals={meals} bottles={bottles} end={end} />
      </Card>

      <SectionTitle
        right={
          dayMeals.length || dayBottles.length
            ? [
                dayMeals.length ? `이유식 ${dayMeals.length}끼${mealMl ? ` ${mealMl}ml` : ""}` : null,
                dayBottles.length ? `분유 ${dayBottles.length}회${bottleMl ? ` ${bottleMl}ml` : ""}` : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      >
        {selected === now ? "오늘" : `${sel.getMonth() + 1}월 ${sel.getDate()}일`}
      </SectionTitle>
      <FeedList meals={dayMeals} bottles={dayBottles} />
    </Screen>
  );
}
