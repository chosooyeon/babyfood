import Screen from "@/components/Screen";
import { Card, Empty, SectionTitle } from "@/components/ui";
import { getBaby, getRecentMeals, getTrials } from "@/lib/queries";
import { BY_ID } from "@/data/ingredients";
import { REACTION_META } from "@/lib/types";
import { dayCount, parseDate } from "@/lib/stage";
import { effectiveStatus } from "@/lib/derive";
import type { Meal } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default async function HistoryPage() {
  const [baby, meals, trials] = await Promise.all([getBaby(), getRecentMeals(), getTrials()]);

  // 날짜별로 묶는다 (쿼리가 이미 날짜 내림차순이라 순서는 그대로 유지된다)
  const byDate = meals.reduce<Map<string, Meal[]>>((acc, m) => {
    (acc.get(m.date) ?? acc.set(m.date, []).get(m.date)!).push(m);
    return acc;
  }, new Map());

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

      <SectionTitle right={meals.length > 0 ? `최근 ${meals.length}끼` : undefined}>
        끼니 타임라인
      </SectionTitle>

      {byDate.size === 0 ? (
        <Empty emoji="📖">기록이 쌓이면 여기 모여요</Empty>
      ) : (
        <div className="space-y-5">
          {[...byDate].map(([date, items]) => {
            const d = parseDate(date);
            return (
              <section key={date}>
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
                <ul className="space-y-2">
                  {items.map((m) => (
                    <li key={m.id}>
                      <Card className="p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[15px] font-extrabold">
                              <span className="mr-1.5 text-[11px] text-muted">{m.slot}끼</span>
                              {m.menu}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {m.ingredient_ids
                                .map((id) => {
                                  const i = BY_ID.get(id);
                                  return i ? `${i.emoji} ${i.name}` : id;
                                })
                                .join("  ") || "재료 미기록"}
                            </p>
                            {m.note ? <p className="mt-1 text-xs text-muted">{m.note}</p> : null}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-base">{REACTION_META[m.reaction].emoji}</p>
                            {m.amount_ml ? (
                              <p className="text-[11px] font-bold text-muted">{m.amount_ml}ml</p>
                            ) : null}
                          </div>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
