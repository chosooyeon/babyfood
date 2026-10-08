import Link from "next/link";
import type { Metadata } from "next";
import { INGREDIENTS } from "@/data/ingredients";
import { OBSERVE_DAYS, SYMPTOM_META } from "@/lib/types";
import Cards, { type GuideCard } from "./Cards";

export const metadata: Metadata = {
  title: "이유식 수첩 · 소개",
  description: "새 재료는 하나씩, 3일씩. 아기 생년월일 하나로 돌아가는 이유식 기록 앱",
};

/**
 * 처음 보는 사람에게 보내는 소개 페이지. 하단 탭이 없고 로그인도 없다.
 * 숫자(재료 수·관찰 일수·증상 수)는 코드에서 읽어서 기획서와 어긋나지 않게 한다.
 */
export default function GuidePage() {
  const cards: GuideCard[] = [
    {
      emoji: "🍚",
      eyebrow: "이유식 수첩",
      title: `새 재료는 하나씩, ${OBSERVE_DAYS}일씩`,
      body: "두 재료를 같이 먹이면 반응이 났을 때 어느 쪽인지 알 수 없어요. 이 앱은 끼니를 적는 것보다 “지금 새 재료 넣어도 되나”를 알려주는 데 집중해요.",
      bullets: ["아기 생년월일 하나만 넣으면 단계·추천·잠금이 자동", "앱 설치 없이 홈 화면에 올려 쓰는 웹앱"],
      tone: "peach",
    },
    {
      emoji: "🥄",
      eyebrow: "오늘 탭",
      title: "끼니를 적으면 관찰이 시작돼요",
      body: "메뉴 이름, 들어간 재료, 먹은 양, 반응(잘 먹음·보통·거부), 메모를 적어요. 처음 먹는 재료를 고르면 그날부터 관찰이 자동으로 시작돼요.",
      bullets: [
        `${OBSERVE_DAYS}일 동안은 “새 재료는 쉬어가요” 배너가 떠요`,
        "날이 지나면 저절로 ‘먹어봄’으로 바뀌어요. 누를 거 없음",
        "지금 단계의 하루 횟수·농도·1회 분량도 위에 보여요",
      ],
      tone: "mint",
    },
    {
      emoji: "🥕",
      eyebrow: "재료 탭",
      title: `재료 ${INGREDIENTS.length}개 도장깨기`,
      body: "먹어봄 · 관찰중 · 이상반응 · 아직 안 먹어봄이 한눈에 보여요. 월령이 안 된 재료는 잠겨 있고, 돌 전 금지 재료는 이유와 함께 빨갛게 표시돼요.",
      bullets: ["다음에 뭘 먹일지 6개를 골라줘요. 순한 것부터", "재료를 누르면 시작 월령과 조리 팁이 나와요"],
      tone: "butter",
    },
    {
      emoji: "⚠️",
      eyebrow: "이상반응이 나오면",
      title: "증상을 체크하고 병원에 보여줘요",
      body: `발진, 구토, 설사 같은 증상 ${Object.keys(SYMPTOM_META).length}가지를 체크하고 메모를 남겨요. 그 재료는 빨간 표시가 되고, 기록 탭 맨 위에 모여요.`,
      bullets: ["기록 탭은 날짜별 끼니 타임라인이에요. D+며칠인지도 같이", "나중에 ‘괜찮았어요’로 되돌릴 수 있어요"],
      tone: "berry",
    },
    {
      emoji: "📲",
      eyebrow: "시작하기",
      title: "홈 화면에 올리고 생년월일만",
      body: "아이폰은 Safari로 열고 공유 버튼 → ‘홈 화면에 추가’. 그러면 앱처럼 전체화면으로 떠요. 설정 탭에서 아기 이름과 생년월일을 넣으면 끝.",
      bullets: ["지금은 체험용이라 들어오는 분들 모두 같은 아기 기록을 봐요. 연습 삼아 눌러보세요"],
      tone: "grape",
    },
  ];

  return (
    <main
      className="mx-auto w-full max-w-md px-4 pb-12"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
    >
      <p className="text-center text-xs font-bold text-muted">이유식 수첩 소개</p>
      <div className="mt-4">
        <Cards cards={cards} />
      </div>
      <Link
        href="/"
        className="mt-6 block w-full rounded-2xl bg-peach py-4 text-center text-base font-extrabold text-white active:scale-[.98]"
      >
        앱 열어보기
      </Link>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        재료 시작 월령은 식약처·대한소아과학회 공개 지침 기준이에요. 아기 상태는 소아과 선생님과 상의하세요.
      </p>
    </main>
  );
}
