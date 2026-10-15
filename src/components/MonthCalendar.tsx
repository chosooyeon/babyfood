import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BY_ID } from "@/data/ingredients";
import type { Meal, Trial } from "@/lib/types";
import { effectiveStatus } from "@/lib/derive";
import { monthRange, parseDate, shiftMonth, toYMD, today } from "@/lib/stage";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_EMOJI = 3;

/**
 * 한 달 이유식 현황 달력. 날마다 그날 들어간 재료 이모지(최대 3개 + N), 처음 먹인 재료가 있으면 초록 점,
 * 이상반응이 난 재료를 처음 먹인 날이면 빨간 점. 기록이 있는 날을 누르면 아래 타임라인의 그날로 내려간다.
 * 서버 컴포넌트 — 달 이동은 ?m= 링크로 한다.
 */
export default function MonthCalendar({ ym, meals, trials }: { ym: string; meals: Meal[]; trials: Trial[] }) {
  const now = today();
  const thisMonth = now.slice(0, 7);
  const { from, to } = monthRange(ym);
  const first = parseDate(from);
  const days = parseDate(to).getDate();

  const byDate = new Map<string, Meal[]>();
  for (const m of meals) (byDate.get(m.date) ?? byDate.set(m.date, []).get(m.date)!).push(m);

  const firstTried = new Map<string, Trial[]>();
  for (const t of trials) {
    if (t.first_date < from || t.first_date > to) continue;
    (firstTried.get(t.first_date) ?? firstTried.set(t.first_date, []).get(t.first_date)!).push(t);
  }
  const newCount = [...firstTried.values()].reduce((s, l) => s + l.length, 0);
  const allergicCount = [...firstTried.values()].flat().filter((t) => effectiveStatus(t, now) === "allergic").length;

  const cells: (string | null)[] = [
    ...Array<null>(first.getDay()).fill(null),
    ...Array.from({ length: days }, (_, i) => toYMD(new Date(first.getFullYear(), first.getMonth(), i + 1))),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <section className="rounded-blob border border-line bg-card p-4 shadow-[0_2px_10px_rgba(160,130,100,.06)]">
      <div className="flex items-center justify-between">
        <Link href={`/history?m=${shiftMonth(ym, -1)}`} className="rounded-full p-1.5 text-muted" aria-label="지난달">
          <ChevronLeft size={18} />
        </Link>
        <h2 className="text-[15px] font-extrabold">
          {first.getFullYear()}년 {first.getMonth() + 1}월
        </h2>
        {ym < thisMonth ? (
          <Link href={`/history?m=${shiftMonth(ym, 1)}`} className="rounded-full p-1.5 text-muted" aria-label="다음달">
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className="p-1.5 text-line" aria-hidden>
            <ChevronRight size={18} />
          </span>
        )}
      </div>

      <p className="mt-1 text-center text-[11px] font-semibold text-muted">
        {meals.length === 0
          ? "이달은 아직 기록이 없어요"
          : `${meals.length}끼 · 새 재료 ${newCount}개${allergicCount ? ` · 이상반응 ${allergicCount}` : ""}`}
      </p>

      <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold text-muted">
        {WEEK.map((w, i) => (
          <div key={w} className={i === 0 ? "text-berry/70" : i === 6 ? "text-sky" : ""}>
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const d = parseDate(date);
          const dayMeals = byDate.get(date) ?? [];
          const isToday = date === now;
          const future = date > now;
          const emojis: string[] = [];
          for (const m of dayMeals)
            for (const id of m.ingredient_ids) {
              const e = BY_ID.get(id)?.emoji;
              if (e && !emojis.includes(e)) emojis.push(e);
            }
          const tried = firstTried.get(date) ?? [];
          const hasNew = tried.length > 0;
          const hasAllergic = tried.some((t) => effectiveStatus(t, now) === "allergic");
          const has = dayMeals.length > 0;

          const body = (
            <>
              <span
                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                  isToday
                    ? "bg-peach text-white"
                    : future
                      ? "text-line"
                      : has
                        ? "text-ink"
                        : "text-muted/60"
                } ${!isToday && d.getDay() === 0 ? "text-berry/70" : ""}`}
              >
                {d.getDate()}
              </span>
              <span className="mt-0.5 flex h-4 items-center justify-center gap-px text-[11px] leading-none">
                {emojis.slice(0, MAX_EMOJI).map((e) => (
                  <span key={e}>{e}</span>
                ))}
                {emojis.length > MAX_EMOJI ? (
                  <span className="text-[9px] font-bold text-muted">+{emojis.length - MAX_EMOJI}</span>
                ) : null}
              </span>
              <span className="mt-0.5 flex h-1.5 items-center justify-center gap-0.5">
                {hasNew ? <span className={`h-1.5 w-1.5 rounded-full ${hasAllergic ? "bg-berry" : "bg-mint"}`} /> : null}
                {dayMeals.some((m) => m.reaction === "refused") ? <span className="h-1.5 w-1.5 rounded-full bg-butter" /> : null}
              </span>
            </>
          );

          return has ? (
            <Link
              key={date}
              href={`/history?m=${ym}#d-${date}`}
              className="rounded-xl py-1 transition-colors active:bg-sand"
              aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 기록 보기`}
            >
              {body}
            </Link>
          ) : (
            <div key={date} className="py-1">
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-muted">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" /> 처음 먹인 재료
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-berry" /> 이상반응
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-butter" /> 거부한 끼니
        </span>
      </div>
    </section>
  );
}
