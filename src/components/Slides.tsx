"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type Slide = { id: string; title: string; emoji?: string; content: ReactNode };

const GAP = 12;

/**
 * 슬라이드 — 카드 하나가 한 장 (/admin 현황·기획서, 홈). 옆으로 넘기거나 위의 칩을 눌러 이동한다.
 * 장마다 높이가 많이 달라서(기획서 "화면" 장은 길고 "단계" 장은 짧다) 트랙 높이를 지금 보는 장에 맞춘다.
 * 안 그러면 짧은 장 아래가 가장 긴 장만큼 비어 보인다.
 */
export default function Slides({ slides, initial = 0 }: { slides: Slide[]; initial?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(initial);
  const [height, setHeight] = useState<number | undefined>(undefined);

  const slideWidth = () => {
    const el = track.current;
    return (el?.firstElementChild as HTMLElement | null)?.offsetWidth ?? el?.clientWidth ?? 0;
  };

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * (slideWidth() + GAP), behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (initial > 0) el.scrollLeft = initial * (slideWidth() + GAP);
    const onScroll = () => setIdx(Math.round(el.scrollLeft / (slideWidth() + GAP)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 보는 장의 높이에 트랙을 맞춘다. 장 안의 내용(쪽 넘김 등)이 바뀌어도 따라가게 ResizeObserver
  useEffect(() => {
    const el = track.current?.children[idx] as HTMLElement | undefined;
    if (!el) return;
    const apply = () => setHeight(el.offsetHeight);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [idx, slides.length]);

  return (
    <div>
      {/* 장 제목 칩 — 가로 스크롤, 보는 장이 진하게 */}
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-3 text-xs font-bold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-current={i === idx ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 transition-colors ${
              i === idx ? "bg-ink text-white" : "bg-sand text-muted"
            }`}
          >
            {s.emoji ? `${s.emoji} ` : ""}
            {s.title}
          </button>
        ))}
      </div>

      <div
        ref={track}
        className="flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overflow-y-hidden transition-[height] duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={height ? { height } : undefined}
      >
        {slides.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            aria-label={`${s.title} (${i + 1}/${slides.length})`}
            className="w-full shrink-0 snap-center"
            // 안 보는 장은 탭·스크린리더 순서에서 뺀다
            inert={i !== idx ? true : undefined}
          >
            {s.content}
          </section>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-bold text-muted">
        <button type="button" onClick={() => go(idx - 1)} disabled={idx <= 0} className="px-2 py-1 disabled:opacity-30">
          ‹
        </button>
        <div className="flex gap-1.5" aria-hidden>
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-peach" : "w-1.5 bg-line"}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(idx + 1)} disabled={idx >= slides.length - 1} className="px-2 py-1 disabled:opacity-30">
          ›
        </button>
      </div>
    </div>
  );
}
