"use client";

import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";

export type Device = {
  device: string | null;
  ip_hash: string | null;
  /** 남의 방문 */
  n: number;
  /** 내 방문 — 따로 보여만 준다 */
  mine_n?: number;
  last: string;
  mine?: boolean;
};

const PER_PAGE = 8;

/** "누가 쓰고 있나 · 7일" — 8대씩 쪽을 넘긴다. 내 기기는 서버가 맨 뒤로 보내 준다 */
export default function DeviceList({ devices }: { devices: Device[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(devices.length / PER_PAGE));
  const p = Math.min(page, pages - 1);
  const shown = devices.slice(p * PER_PAGE, (p + 1) * PER_PAGE);

  if (devices.length === 0) return <p className="mt-3 text-sm text-muted">아직 기록이 없어요.</p>;

  return (
    <>
      <ul className="mt-3 divide-y divide-line">
        {shown.map((d) => (
          <li key={`${d.device}|${d.ip_hash}`} className={`flex items-center justify-between py-2 text-xs ${d.mine ? "opacity-60" : ""}`}>
            <div className="min-w-0">
              <p className="truncate font-bold">
                {d.mine ? <span className="mr-1 rounded bg-sky-soft px-1 py-px text-[10px] font-bold text-ink">나</span> : null}
                {d.device ?? "알 수 없음"}
              </p>
              <p className="text-[11px] text-muted">
                기기 #{d.ip_hash?.slice(0, 6) ?? "------"} · 마지막{" "}
                {formatDistanceToNowStrict(new Date(d.last), { addSuffix: true, locale: ko })}
              </p>
            </div>
            <span className="ml-3 shrink-0 rounded-full bg-sand px-2.5 py-1 font-bold tabular-nums">
              {d.n}회{d.mine_n ? <span className="font-semibold text-muted"> · 나 {d.mine_n}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <nav className="mt-3 flex items-center justify-between text-xs font-bold" aria-label="기기 목록 쪽">
          <button type="button" onClick={() => setPage(p - 1)} disabled={p <= 0} className="rounded-full bg-sand px-3 py-1.5 disabled:opacity-40">
            ‹ 이전
          </button>
          <span className="tabular-nums text-muted">
            {p + 1} / {pages} 쪽 · {devices.length}대
          </span>
          <button type="button" onClick={() => setPage(p + 1)} disabled={p >= pages - 1} className="rounded-full bg-sand px-3 py-1.5 disabled:opacity-40">
            다음 ›
          </button>
        </nav>
      ) : null}
    </>
  );
}
