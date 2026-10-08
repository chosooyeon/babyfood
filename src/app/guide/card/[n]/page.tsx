import { notFound } from "next/navigation";
import CardArt from "../../CardArt";
import { GUIDE_CARDS } from "../../card-data";

/**
 * 저장용 포스터. 1080×1350 (4:5, 카톡·인스타에 맞는 비율) 고정 크기로 그린다.
 * scripts/make-guide-cards.mjs 가 이 화면을 Chrome 으로 찍어 public/guide/card-N.png 로 만든다.
 */
export default async function PosterPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const i = Number(n) - 1;
  const card = GUIDE_CARDS[i];
  if (!card) notFound();

  return (
    <div className="relative overflow-hidden bg-cream text-ink" style={{ width: 1080, height: 1350 }}>
      <CardArt card={card} scale={4.4} />
      <div className="relative flex h-full flex-col px-[88px] pt-[96px] pb-[88px]">
        <div className="flex flex-1 flex-col justify-center pb-[60px]">
          <div style={{ fontSize: 200, lineHeight: 1 }}>{card.emoji}</div>
          <p className="mt-20 text-[34px] font-bold tracking-wide text-muted">{card.eyebrow}</p>
          <h1 className="mt-4 text-[72px] leading-[1.2] font-extrabold tracking-tight [word-break:keep-all]">
            {card.title}
          </h1>
          <p className="mt-12 text-[38px] leading-[1.6] text-ink/80 [word-break:keep-all]">{card.body}</p>
          {card.bullets ? (
            <ul className="mt-14 space-y-6">
              {card.bullets.map((b) => (
                <li key={b} className="flex gap-6 text-[34px] leading-[1.45] [word-break:keep-all]">
                  <span className="mt-[18px] h-[16px] w-[16px] shrink-0 rounded-full bg-ink/40" />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-end justify-between">
          <p className="text-[28px] font-extrabold">
            이유식 수첩 <span className="ml-2 font-semibold text-muted">babyfood-sable.vercel.app</span>
          </p>
          <p className="text-[28px] font-bold text-muted">
            {i + 1} / {GUIDE_CARDS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
