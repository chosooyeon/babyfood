import { DECO_SPOTS, TONE_BG, TONE_BLOB, type GuideCard } from "./card-data";

/**
 * 카드 배경 — 그라데이션 + 흐린 색 덩어리 둘 + 주제 이모지 6개를 가장자리에 흩뿌린다.
 * 화면 카드와 저장용 포스터가 같이 쓴다. 글자 위에는 아무것도 올리지 않는다.
 */
export default function CardArt({ card, scale = 1 }: { card: GuideCard; scale?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-br ${TONE_BG[card.tone]}`}>
      <div
        className={`absolute rounded-full opacity-25 blur-3xl ${TONE_BLOB[card.tone]}`}
        style={{ width: "70%", height: "45%", right: "-20%", top: "-12%" }}
      />
      <div
        className={`absolute rounded-full opacity-15 blur-3xl ${TONE_BLOB[card.tone]}`}
        style={{ width: "60%", height: "35%", left: "-18%", bottom: "-10%" }}
      />
      {card.deco.map((e, i) => {
        const p = DECO_SPOTS[i];
        return (
          <span
            key={i}
            className="absolute select-none opacity-[.22]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${2.2 * p.s * scale}rem`,
              transform: `translate(-50%, -50%) rotate(${p.r}deg)`,
              lineHeight: 1,
            }}
          >
            {e}
          </span>
        );
      })}
    </div>
  );
}
