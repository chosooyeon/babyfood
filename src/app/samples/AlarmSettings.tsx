"use client";

import { useState } from "react";
import { BellRing, Download } from "lucide-react";
import { ALARM_CHOICES, DEFAULT_ALARM } from "@/lib/samples";

type BrandLite = { id: string; name: string; emoji: string; rule: string };

/**
 * 캘린더 알림 설정. 몇 분 전에 울릴지와 어느 브랜드를 넣을지 고르면
 * 그에 맞는 .ics 주소를 만들어 "구독"(webcal://) 또는 "파일로 받기"로 넘긴다.
 *
 * 구독을 권하는 이유: 시간표가 바뀌면 폰 캘린더가 알아서 따라온다. 파일로 받으면 그 시점에 고정.
 * 선택을 저장하지는 않는다 — 구독 자체가 선택을 들고 있고, 다시 고르는 데 두 번 탭이면 된다.
 */
export default function AlarmSettings({
  brands,
  claimed,
  android,
}: {
  brands: BrandLite[];
  claimed: string[];
  /** 안드로이드면 .ics 파일 받기를 같이 보여준다 — webcal 구독이 안 되는 캘린더 앱이 있다 */
  android: boolean;
}) {
  const [before, setBefore] = useState<number>(DEFAULT_ALARM);
  // 기본은 "아직 신청 안 한 브랜드 전부"
  const [picked, setPicked] = useState<Set<string>>(
    () =>
      new Set(brands.filter((b) => !claimed.includes(b.id)).map((b) => b.id)),
  );

  const q = new URLSearchParams({ before: String(before) });
  if (picked.size !== brands.length) q.set("brands", [...picked].join(","));
  const path = `/samples/calendar.ics?${q}`;
  const none = picked.size === 0;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // webcal:// 은 호스트가 필요한데 서버 렌더 때는 모른다. 누를 때 window 에서 읽는다.
  const subscribe = () => {
    window.location.href = `webcal://${window.location.host}${path}`;
  };

  return (
    <div id="alarm">
      <p className="text-xs font-semibold text-muted">몇 분 전에 알릴까요?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ALARM_CHOICES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setBefore(m)}
            aria-pressed={before === m}
            className={`rounded-full px-3.5 py-2 text-xs font-bold active:scale-[.97] ${
              before === m ? "bg-peach text-white" : "bg-sand text-ink"
            }`}
          >
            {m >= 60 ? `${m / 60}시간 전` : `${m}분 전`}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-muted">
        어느 브랜드를 넣을까요?
      </p>
      <ul className="mt-2 space-y-1.5">
        {brands.map((b) => {
          const on = picked.has(b.id);
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => toggle(b.id)}
                aria-pressed={on}
                className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left active:scale-[.99] ${
                  on ? "bg-mint-soft" : "bg-sand opacity-60"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                    on ? "bg-mint text-white" : "border border-line bg-card"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold">
                    {b.emoji} {b.name}
                  </span>
                  <span className="block text-[11px] text-muted">{b.rule}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={subscribe}
        disabled={none}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-peach py-3.5 text-sm font-bold text-white active:scale-[.98] disabled:bg-muted"
      >
        <BellRing size={16} />{" "}
        {android ? "캘린더에 구독하기" : "아이폰 캘린더에 구독하기"}
      </button>
      {android ? (
        <>
          <a
            href={none ? undefined : path}
            aria-disabled={none}
            className={`mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-sand py-3 text-xs font-bold text-ink active:scale-[.98] ${
              none ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Download size={13} /> 파일로 받기 (.ics)
          </a>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            구독이 안 되면 파일을 받아 캘린더 앱에서 열어주세요.
          </p>
        </>
      ) : null}
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        구독하면 캘린더에 반복 일정이 생기고, 시간표가 바뀌어도 폰이 따라와요.
        {android
          ? " 그만 받으려면 캘린더 앱의 구독 캘린더에서 지우면 돼요."
          : " 그만 받으려면 아이폰 설정 → 캘린더 → 계정 → 구독 캘린더에서 지우면 돼요."}
      </p>
    </div>
  );
}
