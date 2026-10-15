import Link from "next/link";
import type { Bottle, Meal } from "@/lib/types";
import { parseDate } from "@/lib/stage";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
/** 한 시간 = 20px → 하루 480px. 막대 안에 시각을 적을 만큼 높다 */
const HOUR_PX = 20;
const CHART_H = HOUR_PX * 24;
/** 막대 높이 (분) — 실제 걸린 시간이 아니라 "보이는 굵기" */
const BAR_MIN = 45;
const BAR_PX = (BAR_MIN / 60) * HOUR_PX;

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
/** 막대 윗변 위치. 자정 근처는 막대가 잘리지 않게 안쪽으로 */
function topPx(hhmm: string): number {
  const center = (minutesOf(hhmm) / 60) * HOUR_PX;
  return Math.min(CHART_H - BAR_PX, Math.max(0, center - BAR_PX / 2));
}

/**
 * 베이비타임식 하루 세로줄 차트. 열 하나가 하루(0시 위 → 24시 아래), 열 너비를 꽉 채운 막대가 한 번 먹인 것.
 * 복숭아색이 이유식, 하늘색이 분유, 막대 안에 시각. 밤(21시~7시)은 살짝 어둡게. 열을 누르면 그날이 선택된다 (?d=).
 */
export default function FeedChart({
  days,
  selected,
  today,
  meals,
  bottles,
  end,
}: {
  days: string[];
  selected: string;
  today: string;
  meals: Meal[];
  bottles: Bottle[];
  end: string;
}) {
  const mealsBy = new Map<string, Meal[]>();
  for (const m of meals) (mealsBy.get(m.date) ?? mealsBy.set(m.date, []).get(m.date)!).push(m);
  const bottlesBy = new Map<string, Bottle[]>();
  for (const b of bottles) (bottlesBy.get(b.date) ?? bottlesBy.set(b.date, []).get(b.date)!).push(b);

  return (
    <div className="flex gap-1">
      {/* 시간 축 — 3시간마다 숫자 */}
      <div className="relative w-5 shrink-0 pt-9 text-[9px] font-bold text-muted">
        <div className="relative" style={{ height: CHART_H }}>
          {Array.from({ length: 9 }, (_, i) => i * 3).map((h) => (
            <span key={h} className="absolute right-0 -translate-y-1/2 tabular-nums" style={{ top: h * HOUR_PX }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {days.map((d) => {
        const date = parseDate(d);
        const on = d === selected;
        const isToday = d === today;
        const dm = mealsBy.get(d) ?? [];
        const db = bottlesBy.get(d) ?? [];
        const untimed = dm.filter((m) => !m.fed_at);
        return (
          <Link
            key={d}
            href={`/feeds?end=${end}&d=${d}`}
            scroll={false}
            className="min-w-0 flex-1"
            aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
          >
            <div className="h-9 text-center leading-tight">
              <p className={`text-[10px] font-bold ${date.getDay() === 0 ? "text-berry/70" : date.getDay() === 6 ? "text-sky" : "text-muted"}`}>
                {WEEK[date.getDay()]}
              </p>
              <p
                className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums ${
                  isToday ? "bg-peach text-white" : on ? "bg-ink text-white" : "text-ink"
                }`}
              >
                {date.getDate()}
              </p>
            </div>
            <div
              className={`relative overflow-hidden rounded-lg transition-colors ${on ? "bg-peach-soft/70 ring-2 ring-peach/60" : "bg-sand/70"}`}
              style={{ height: CHART_H }}
            >
              {/* 밤 */}
              <div className="absolute inset-x-0 top-0 bg-ink/[.05]" style={{ height: 7 * HOUR_PX }} />
              <div className="absolute inset-x-0 bottom-0 bg-ink/[.05]" style={{ height: 3 * HOUR_PX }} />
              {/* 한 시간마다 가는 선, 3시간마다 조금 진한 선 */}
              {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                <div
                  key={h}
                  className={`absolute inset-x-0 border-t ${h % 3 === 0 ? "border-ink/15" : "border-line/70"}`}
                  style={{ top: h * HOUR_PX }}
                />
              ))}
              {/* 시각 없는 옛 끼니 — 맨 아래에 옅은 막대 */}
              {untimed.map((m, i) => (
                <div
                  key={m.id}
                  className="absolute inset-x-0 rounded-sm bg-peach/35"
                  style={{ height: BAR_PX, bottom: i * (BAR_PX + 2) }}
                  title={`이유식 (시각 없음) ${m.menu}`}
                />
              ))}
              {db.map((b) => (
                <Bar key={b.id} top={topPx(b.fed_at)} time={b.fed_at} tone="sky" title={`분유 ${b.fed_at}${b.amount_ml ? ` ${b.amount_ml}ml` : ""}`} />
              ))}
              {dm
                .filter((m) => m.fed_at)
                .map((m) => (
                  <Bar key={m.id} top={topPx(m.fed_at!)} time={m.fed_at!} tone="peach" title={`이유식 ${m.fed_at} ${m.menu}`} />
                ))}
            </div>
            <p className="mt-1 h-4 text-center text-[10px] font-bold text-muted tabular-nums">
              {dm.length || db.length ? (
                <>
                  {dm.length ? <span className="text-peach">{dm.length}</span> : null}
                  {dm.length && db.length ? " · " : ""}
                  {db.length ? <span className="text-sky">{db.length}</span> : null}
                </>
              ) : null}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

/** 열 너비를 꽉 채운 막대. 안에 시각 */
function Bar({ top, time, tone, title }: { top: number; time: string; tone: "peach" | "sky"; title: string }) {
  return (
    <div
      className={`absolute inset-x-0 flex items-center justify-center rounded-sm text-[9px] font-extrabold text-white tabular-nums ${
        tone === "peach" ? "bg-peach" : "bg-sky"
      }`}
      style={{ top, height: BAR_PX }}
      title={title}
    >
      {time}
    </div>
  );
}
