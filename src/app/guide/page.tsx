import Link from "next/link";
import type { Metadata } from "next";
import { Download } from "lucide-react";
import Cards from "./Cards";
import { GUIDE_CARDS } from "./card-data";

export const metadata: Metadata = {
  title: "앱 소개 — 새 재료는 하나씩, 3일씩",
  description:
    `이유식 수첩이 뭘 하는 앱인지 카드 ${GUIDE_CARDS.length}장으로. 끼니를 적으면 3일 관찰이 시작되고, 수유 시계와 7일 차트, 재료 도장깨기, 이상반응 기록, 시판 이유식 체험팩 시간표까지. 카드는 사진으로 저장해 보낼 수 있어요.`,
  alternates: { canonical: "/guide" },
};

/**
 * 처음 보는 사람에게 보내는 소개 페이지. 하단 탭이 없고 로그인도 없다.
 * 카드 내용은 ./card-data.ts 하나에서 오고, 아래 이미지들은 npm run cards 로 만든다.
 */
export default function GuidePage() {
  return (
    <main
      className="mx-auto w-full max-w-md px-4 pb-12"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
    >
      <p className="text-center text-xs font-bold text-muted">이유식 수첩 소개</p>
      <div className="mt-4">
        <Cards cards={GUIDE_CARDS} />
      </div>
      <Link
        href="/"
        className="mt-6 block w-full rounded-2xl bg-peach py-4 text-center text-base font-extrabold text-white active:scale-[.98]"
      >
        앱 열어보기
      </Link>

      <section className="mt-10">
        <h2 className="text-sm font-extrabold">카드를 사진으로 저장</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          카톡·인스타에 올리기 좋은 4:5 비율이에요. 아이폰은 그림을 <b className="text-ink">길게 눌러</b>{" "}
          “사진에 저장”, 컴퓨터는 아래 받기 버튼.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-3">
          {GUIDE_CARDS.map((c, i) => {
            const src = `/guide/card-${i + 1}.png`;
            return (
              <li key={c.title} className="overflow-hidden rounded-2xl border border-line bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 PNG, 최적화 불필요 */}
                <img src={src} alt={`${i + 1}. ${c.title}`} width={1080} height={1350} className="block w-full" />
                <a
                  href={src}
                  download={`이유식수첩-소개-${i + 1}.png`}
                  className="flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-muted"
                >
                  <Download size={12} /> {i + 1}장 받기
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
        재료 시작 월령은 식약처·대한소아과학회 공개 지침 기준이에요. 아기 상태는 소아과 선생님과 상의하세요.
      </p>
      <p className="mt-3 text-center text-[11px] text-muted">
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        {" · "}
        <Link href="/terms" className="underline">
          이용약관
        </Link>
      </p>
    </main>
  );
}
