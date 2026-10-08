"use client";

import { useEffect, useRef, useState } from "react";

export type GuideCard = {
  emoji: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  tone: "peach" | "mint" | "butter" | "berry" | "grape";
};

const TONE: Record<GuideCard["tone"], string> = {
  peach: "from-peach-soft to-cream",
  mint: "from-mint-soft to-cream",
  butter: "from-butter-soft to-cream",
  berry: "from-berry-soft to-cream",
  grape: "from-grape-soft to-cream",
};

/** 좌우로 넘기는 카드. 스크롤 스냅만 쓰고, 점 표시를 위해 현재 위치만 추적한다. */
export default function Cards({ cards }: { cards: GuideCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.firstElementChild?.clientWidth ?? el.clientWidth;
      setIdx(Math.round(el.scrollLeft / (w + 12)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((c, i) => (
          <article
            key={c.title}
            className={`w-[86%] shrink-0 snap-center rounded-blob border border-line bg-gradient-to-b ${TONE[c.tone]} p-6`}
            aria-label={`${i + 1} / ${cards.length}`}
          >
            <div className="text-4xl">{c.emoji}</div>
            <p className="mt-4 text-[11px] font-bold tracking-wide text-muted">{c.eyebrow}</p>
            <h2 className="mt-1 text-xl font-extrabold leading-snug tracking-tight">{c.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{c.body}</p>
            {c.bullets ? (
              <ul className="mt-4 space-y-2">
                {c.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-[13px] leading-snug">
                    <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-6 text-[11px] font-bold text-muted">
              {i + 1} / {cards.length}
              {i < cards.length - 1 ? " · 옆으로 넘기세요 →" : ""}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {cards.map((c, i) => (
          <span
            key={c.title}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-peach" : "w-1.5 bg-line"}`}
          />
        ))}
      </div>
    </>
  );
}
