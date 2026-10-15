import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";
import type { SampleBrand } from "@/data/samples";
import { ruleLabel, timeLabel, untilLabel, type Opening } from "@/lib/samples";
import Countdown from "./Countdown";

const LANE_H = 34;
/** 이 분 안에 겹치는 오픈은 아래 줄로 내린다 (칩 하나가 가로의 1/8 쯤) */
const NEAR_MIN = 170;

const minOf = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const pct = (min: number) => (min / 1440) * 100;

/**
 * 체험팩 오픈 시간표 — 0시부터 24시까지 가로 한 줄. 앞으로 24시간 안에 열리는 브랜드를
 * 오픈 시각 자리에 이모지·시각 칩으로 놓는다. 다음 오픈은 복숭아색, 나머지는 흰 칩.
 * 같은 시각(자정 둘, 10시 둘)은 아랫줄로 내려 겹치지 않는다. 밤은 어둡게, 지금은 세로 점선.
 */
export default function OpenTimeline({
  openings,
  nowMin,
  months,
}: {
  openings: Opening[];
  /** 한국 시각 기준 지금 (분) — 서버가 그릴 때의 값 */
  nowMin: number;
  months: number | null;
}) {
  const next = openings[0];
  const soon = [...openings.filter((o) => o.inMinutes < 1440)].sort((a, b) => minOf(a.time) - minOf(b.time));

  // 줄 배정: 앞 칩과 가까우면 다음 줄
  const laneEnd: number[] = [];
  const placed = soon.map((o) => {
    const m = minOf(o.time);
    let lane = laneEnd.findIndex((end) => m - end >= NEAR_MIN);
    if (lane < 0) lane = laneEnd.length;
    laneEnd[lane] = m;
    return { o, m, lane };
  });
  const lanes = Math.max(1, laneEnd.length);

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-extrabold">오늘 오픈 시간표</h2>
        <p className="text-[11px] font-bold text-muted">
          지금 {String(Math.floor(nowMin / 60)).padStart(2, "0")}:{String(nowMin % 60).padStart(2, "0")}
        </p>
      </div>

      {/* 가로 시간표 */}
      <div className="relative mt-3 overflow-hidden rounded-xl bg-sand/70" style={{ height: lanes * LANE_H + 12 }}>
        <div className="absolute inset-y-0 left-0 bg-ink/[.05]" style={{ width: `${pct(7 * 60)}%` }} />
        <div className="absolute inset-y-0 right-0 bg-ink/[.05]" style={{ width: `${100 - pct(21 * 60)}%` }} />
        {[3, 6, 9, 12, 15, 18, 21].map((h) => (
          <div key={h} className={`absolute inset-y-0 border-l ${h % 6 === 0 ? "border-ink/15" : "border-line/70"}`} style={{ left: `${pct(h * 60)}%` }} />
        ))}
        {/* 지나간 시간 */}
        <div className="absolute inset-y-0 left-0 bg-cream/60" style={{ width: `${pct(nowMin)}%` }} />
        <div className="absolute inset-y-0 border-l-2 border-dashed border-ink/50" style={{ left: `${pct(nowMin)}%` }} />

        {placed.map(({ o, m, lane }) => {
          const p = pct(m + 15);
          const align = p < 9 ? "translateX(0)" : p > 91 ? "translateX(-100%)" : "translateX(-50%)";
          const isNext = o === next;
          return (
            <span
              key={o.brand.id}
              className={`absolute flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-extrabold tabular-nums whitespace-nowrap ${
                isNext ? "bg-peach text-white shadow-[0_2px_8px_rgba(255,155,122,.45)]" : "border border-peach/50 bg-card text-ink"
              }`}
              style={{ left: `${Math.max(p, 1)}%`, top: lane * LANE_H + 6, transform: align }}
              title={`${o.brand.name} ${timeLabel(o.time)}`}
            >
              <span className="text-sm">{o.brand.emoji}</span>
              {o.time}
            </span>
          );
        })}
      </div>
      <div className="relative mt-1 h-4 text-[10px] font-bold text-muted tabular-nums">
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h} className="absolute" style={{ left: `${pct(h * 60)}%`, transform: h === 0 ? "none" : h === 24 ? "translateX(-100%)" : "translateX(-50%)" }}>
            {h === 0 ? "🌙 0" : h === 12 ? "☀️ 12" : h}
          </span>
        ))}
      </div>

      {soon.length > 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted [word-break:keep-all]">
          {soon.map((o, i) => (
            <span key={o.brand.id}>
              {i ? " · " : ""}
              {o.brand.emoji} {o.brand.name}
            </span>
          ))}
        </p>
      ) : null}

      {next ? (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-peach-soft/60 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-muted">다음 오픈</p>
            <p className="truncate text-base font-extrabold">
              {next.brand.emoji} {next.brand.name}{" "}
              <span className="text-sm text-peach">
                <Countdown openAt={next.epochMs} fallback={untilLabel(next)} />
              </span>
            </p>
            <p className="text-[11px] text-muted [word-break:keep-all]">
              {next.dayLabel} {timeLabel(next.time)} · {ruleLabel(next.brand)}
            </p>
            <FitBadge brand={next.brand} months={months} />
          </div>
          <a
            href={next.brand.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-peach px-3 py-2 text-xs font-bold text-white active:scale-[.98]"
          >
            열기 <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">시간이 정해진 브랜드는 전부 신청했어요 🎉</p>
      )}
    </Card>
  );
}

function FitBadge({ brand, months }: { brand: SampleBrand; months: number | null }) {
  if (months === null || brand.fromMonth === undefined) return null;
  const ok = months >= brand.fromMonth && (brand.toMonth === undefined || months <= brand.toMonth);
  return (
    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${ok ? "bg-mint-soft text-ink" : "bg-sand text-muted"}`}>
      {ok ? `지금 ${months}개월, 맞아요` : months < brand.fromMonth ? `${brand.fromMonth}개월부터` : `${brand.toMonth}개월까지`}
    </span>
  );
}
