/**
 * 최근 14일 방문 수 막대. 시리즈가 하나라 색은 peach 하나만 쓰고,
 * 값은 가장 높은 날과 오늘에만 직접 적는다. 나머지는 막대에 올리면(title) 보인다.
 */
export default function VisitsChart({ days }: { days: { day: string; n: number; devices: number }[] }) {
  const W = 320;
  const H = 130;
  const top = 20;
  const bottom = 20;
  const gap = 4;
  const plotH = H - top - bottom;
  const max = Math.max(1, ...days.map((d) => d.n));
  const bw = (W - gap * (days.length - 1)) / days.length;
  const maxIdx = days.reduce((best, d, i) => (d.n > days[best].n ? i : best), 0);
  const last = days.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="최근 14일 방문 수">
      <line x1={0} x2={W} y1={top + plotH} y2={top + plotH} className="stroke-line" strokeWidth={1} />
      {days.map((d, i) => {
        const x = i * (bw + gap);
        const h = Math.max(d.n > 0 ? 3 : 0, (d.n / max) * plotH);
        const y = top + plotH - h;
        const r = Math.min(4, bw / 2, h);
        const date = new Date(d.day + "T00:00:00");
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        const showValue = d.n > 0 && (i === maxIdx || i === last);
        const showDay = i % 2 === last % 2;
        return (
          <g key={d.day}>
            <title>{`${label} · ${d.n}회 · 기기 ${d.devices}대`}</title>
            {h > 0 ? (
              <path
                d={`M${x},${y + r} a${r},${r} 0 0 1 ${r},-${r} h${bw - 2 * r} a${r},${r} 0 0 1 ${r},${r} V${top + plotH} H${x} Z`}
                className={i === last ? "fill-peach" : "fill-peach/60"}
              />
            ) : null}
            {showValue ? (
              <text x={x + bw / 2} y={y - 5} textAnchor="middle" className="fill-ink text-[10px] font-bold">
                {d.n}
              </text>
            ) : null}
            {showDay ? (
              <text x={x + bw / 2} y={H - 5} textAnchor="middle" className="fill-muted text-[9px] font-semibold">
                {label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
