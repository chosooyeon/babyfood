import type { Metadata } from "next";
import Screen from "@/components/Screen";
import { Card, Empty, SectionTitle } from "@/components/ui";
import FeedList from "@/components/FeedList";
import { getBaby, getBottlesBetween, getMealsInMonth, getTrials } from "@/lib/queries";
import MonthCalendar from "@/components/MonthCalendar";
import { BY_ID } from "@/data/ingredients";
import { dayCount, monthRange, parseDate, today } from "@/lib/stage";
import { effectiveStatus } from "@/lib/derive";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

/** 한 집의 기록만 보이는 화면 — 검색에 나올 이유가 없다 */
export const metadata: Metadata = {
  title: "기록",
  robots: { index: false, follow: true },
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  await track("/history");
  const { m } = await searchParams;
  // ?m=2026-10 — 달력과 타임라인이 같은 달을 본다. 없거나 이상하면 이번 달
  const ym = m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : today().slice(0, 7);
  const { from, to } = monthRange(ym);
  const [baby, meals, bottles, trials] = await Promise.all([getBaby(), getMealsInMonth(ym), getBottlesBetween(from, to), getTrials()]);

  // 끼니든 분유든 있는 날짜를 최근 것부터. 하루 안의 정렬은 FeedList 가 시각순으로 한다
  const dates = [...new Set([...meals.map((m) => m.date), ...bottles.map((b) => b.date)])].sort().reverse();

  const flagged = trials.filter((t) => effectiveStatus(t) === "allergic");

  return (
    <Screen title="기록">
      {flagged.length > 0 ? (
        <>
          <SectionTitle>⚠️ 이상반응이 있던 재료</SectionTitle>
          <Card className="border-berry/40 bg-berry-soft">
            <p className="text-xs leading-relaxed">
              병원에 갈 때 이 목록을 보여주세요.
            </p>
            <ul className="mt-2 space-y-1.5 text-[13px] font-bold">
              {flagged.map((t) => {
                const i = BY_ID.get(t.ingredient_id);
                return (
                  <li key={t.id}>
                    {i?.emoji ?? "•"} {i?.name ?? t.ingredient_id}
                    <span className="ml-1 font-normal text-muted">{t.first_date}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      ) : null}

      <div className={flagged.length > 0 ? "mt-7" : ""}>
        <MonthCalendar ym={ym} meals={meals} trials={trials} />
      </div>

      <SectionTitle
        right={
          meals.length || bottles.length
            ? [meals.length ? `${meals.length}끼` : null, bottles.length ? `분유 ${bottles.length}회` : null].filter(Boolean).join(" · ")
            : undefined
        }
      >
        {Number(ym.slice(5))}월 타임라인
      </SectionTitle>

      {dates.length === 0 ? (
        <Empty emoji="📖">{ym === today().slice(0, 7) ? "기록이 쌓이면 여기 모여요" : "이달엔 기록이 없어요"}</Empty>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => {
            const d = parseDate(date);
            return (
              <section key={date} id={`d-${date}`} className="scroll-mt-4">
                <div className="mb-2 flex items-baseline gap-2">
                  <b className="text-sm">
                    {d.getMonth() + 1}월 {d.getDate()}일 ({WEEK[d.getDay()]})
                  </b>
                  {baby ? (
                    <span className="text-[11px] font-bold text-muted">
                      D+{dayCount(baby.birth_date, date)}
                    </span>
                  ) : null}
                </div>
                <FeedList meals={meals.filter((m) => m.date === date)} bottles={bottles.filter((b) => b.date === date)} />
              </section>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
