"use client";

import { useNowHHMM } from "@/lib/use-now";

/** 시계에 찍을 한 번의 식사. time 은 'HH:MM' */
export type Feed = { time: string; amount: number | null };

const SIZE = 240;
const C = SIZE / 2;
const R = 102; // 파이 반지름
const R_LABEL = R + 12;
/** 가운데 정보 원. 글 세 줄이 들어가는 최소 크기 */
const R_INNER = 62;
/** 한 번 먹인 걸 몇 분짜리 조각으로 칠할지 — 실제 걸린 시간이 아니라 "보이는 굵기" */
const SLICE_MIN = 30;

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 0시가 맨 위, 시계방향으로 24시간. 분 → 좌표 */
function pointAt(min: number, r: number): { x: number; y: number } {
  const a = (min / 1440) * Math.PI * 2;
  // 소수 둘째 자리까지만 — 서버와 브라우저의 부동소수점 끝자리가 달라 hydration 경고가 났다
  return { x: Math.round((C + r * Math.sin(a)) * 100) / 100, y: Math.round((C - r * Math.cos(a)) * 100) / 100 };
}

/** 가운데에서 시작하는 부채꼴 (from분 ~ to분). 가운데는 정보 원이 덮는다 */
function wedge(from: number, to: number): string {
  const s = pointAt(from, R);
  const e = pointAt(Math.min(to, 1440), R);
  const large = to - from > 720 ? 1 : 0;
  return `M ${C} ${C} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

/**
 * 오늘의 수유 시계 — 24시간 파이. 먹인 시각마다 가운데까지 채운 조각을 칠한다. 이유식 복숭아색, 분유 하늘색.
 * 카드 폭을 꽉 채우고, 끼니 수·분유 횟수·총 ml·마지막으로 먹은 지는 파이 가운데 작은 원 안에 적는다.
 * "지금" 표시와 "마지막으로 먹은 지 N분"은 기기 시간이 필요해 마운트 뒤에 그린다.
 */
export default function FeedClock({ meals, bottles }: { meals: Feed[]; bottles: Feed[] }) {
  const now = useNowHHMM();
  const mealMl = meals.reduce((s, m) => s + (m.amount ?? 0), 0);
  const bottleMl = bottles.reduce((s, b) => s + (b.amount ?? 0), 0);
  const last = [...meals, ...bottles].map((f) => f.time).sort().at(-1) ?? null;
  const since = now && last && minutesOf(now) >= minutesOf(last) ? minutesOf(now) - minutesOf(last) : null;
  const nowMin = now ? minutesOf(now) : null;

  const lastLabel =
    last === null
      ? "아직 안 먹었어요"
      : since === null
        ? `마지막 ${last}`
        : since < 60
          ? `${since}분 전에 먹었어요`
          : `${Math.floor(since / 60)}시간 ${since % 60}분 전에 먹었어요`;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[340px]" role="img" aria-label="오늘 먹은 시간">
      <circle cx={C} cy={C} r={R} className="fill-sand" />
      {/* 아직 안 온 시간은 조금 더 옅게 */}
      {nowMin !== null && nowMin < 1440 ? <path d={wedge(nowMin, 1440)} className="fill-cream" /> : null}
      {bottles.map((b, i) => (
        <path key={`b${i}`} d={wedge(minutesOf(b.time), minutesOf(b.time) + SLICE_MIN)} className="fill-sky" />
      ))}
      {meals.map((m, i) => (
        <path key={`m${i}`} d={wedge(minutesOf(m.time), minutesOf(m.time) + SLICE_MIN)} className="fill-peach" />
      ))}
      {[0, 6, 12, 18].map((h) => {
        const p = pointAt(h * 60, R_LABEL);
        const label = h === 0 ? "🌙" : h === 12 ? "☀️" : String(h);
        return (
          <text key={h} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-muted" style={{ fontSize: h % 12 === 0 ? 10 : 9, fontWeight: 700 }}>
            {label}
          </text>
        );
      })}
      {/* 지금 — 파이 바깥에 작은 삼각 표시 */}
      {nowMin !== null
        ? (() => {
            const tip = pointAt(nowMin, R + 1);
            const l = pointAt(nowMin - 9, R + 8);
            const r = pointAt(nowMin + 9, R + 8);
            return <polygon points={`${tip.x},${tip.y} ${l.x},${l.y} ${r.x},${r.y}`} className="fill-ink/60" />;
          })()
        : null}

      {/* 가운데 정보 원 — 조각 위에 얹어 가운데를 비운다 */}
      <circle cx={C} cy={C} r={R_INNER} className="fill-card" />
      <circle cx={C} cy={C} r={R_INNER} className="fill-none stroke-line" strokeWidth={1} />
      {/* 두 줄 다 가운데 정렬 — 색 점은 글자 앞에 ● 로 넣어 줄 전체가 한 덩어리로 가운데 온다 */}
      <g style={{ fontWeight: 800 }}>
        <text x={C} y={C - 17} textAnchor="middle" dominantBaseline="central" className="fill-ink" style={{ fontSize: 10.5 }}>
          <tspan className="fill-peach" style={{ fontSize: 8 }}>●</tspan> 이유식 {meals.length}끼
          {mealMl ? (
            <tspan className="fill-muted" style={{ fontSize: 9, fontWeight: 600 }}>
              {" "}· {mealMl}ml
            </tspan>
          ) : null}
        </text>
        <text x={C} y={C} textAnchor="middle" dominantBaseline="central" className="fill-ink" style={{ fontSize: 10.5 }}>
          <tspan className="fill-sky" style={{ fontSize: 8 }}>●</tspan> 분유 {bottles.length}회
          {bottleMl ? (
            <tspan className="fill-muted" style={{ fontSize: 9, fontWeight: 600 }}>
              {" "}· {bottleMl}ml
            </tspan>
          ) : null}
        </text>
      </g>
      <text x={C} y={C + 20} textAnchor="middle" dominantBaseline="central" className="fill-muted" style={{ fontSize: 8.5, fontWeight: 600 }}>
        {lastLabel}
      </text>
    </svg>
  );
}
