import { INGREDIENTS } from "@/data/ingredients";
import { SAMPLE_BRANDS } from "@/data/samples";
import { OBSERVE_DAYS, SYMPTOM_META } from "@/lib/types";

export type Tone = "peach" | "mint" | "butter" | "berry" | "grape";

export type GuideCard = {
  emoji: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  tone: Tone;
  /** 배경에 흩뿌릴 이모지. 카드 주제와 어울리는 것 6개 */
  deco: string[];
};

/** 소개 카드 6장. /guide 화면과 /guide/card/[n] 포스터가 같은 데이터를 쓴다. */
export const GUIDE_CARDS: GuideCard[] = [
  {
    emoji: "🍚",
    eyebrow: "이유식 수첩",
    title: `새 재료는 하나씩, ${OBSERVE_DAYS}일씩`,
    body: "두 재료를 같이 먹이면 반응이 났을 때 어느 쪽인지 알 수 없어요. 이 앱은 끼니를 적는 것보다 “지금 새 재료 넣어도 되나”를 알려주는 데 집중해요.",
    bullets: [
      "아기 생년월일 하나만 넣으면 단계·추천·잠금이 자동",
      "앱 설치 없이 홈 화면에 올려 쓰는 웹앱",
    ],
    tone: "peach",
    deco: ["🥣", "🍼", "👶", "🥄", "🍠", "🌱"],
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
    deco: ["😋", "🙂", "😣", "📝", "⏳", "🥦"],
  },
  {
    emoji: "🥕",
    eyebrow: "재료 탭",
    title: `재료 ${INGREDIENTS.length}개 도장깨기`,
    body: "먹어봄 · 관찰중 · 이상반응 · 아직 안 먹어봄이 한눈에 보여요. 월령이 안 된 재료는 잠겨 있고, 돌 전 금지 재료는 이유와 함께 빨갛게 표시돼요.",
    bullets: [
      "다음에 뭘 먹일지 6개를 골라줘요. 순한 것부터",
      "재료를 누르면 시작 월령과 조리 팁이 나와요",
    ],
    tone: "butter",
    deco: ["🥔", "🎃", "🍌", "🥬", "🐟", "🔒"],
  },
  {
    emoji: "⚠️",
    eyebrow: "이상반응이 나오면",
    title: "증상을 체크하고 병원에 보여줘요",
    body: `발진, 구토, 설사 같은 증상 ${Object.keys(SYMPTOM_META).length}가지를 체크하고 메모를 남겨요. 그 재료는 빨간 표시가 되고, 기록 탭 맨 위에 모여요.`,
    bullets: [
      "기록 탭은 날짜별 끼니 타임라인이에요. D+며칠인지도 같이",
      "나중에 ‘괜찮았어요’로 되돌릴 수 있어요",
    ],
    tone: "berry",
    deco: ["🔴", "🤮", "😭", "🏥", "📋", "🩺"],
  },
  {
    emoji: "📲",
    eyebrow: "시작하기",
    title: "홈 화면에 올리고 생년월일만",
    body: "아이폰은 Safari로 열고 공유 버튼 → ‘홈 화면에 추가’. 그러면 앱처럼 전체화면으로 떠요. 설정 탭에서 아기 이름과 생년월일을 넣으면 끝.",
    bullets: [
      "기록은 기기마다 받는 수첩 코드로 묶여요. 아빠 폰에도 같은 코드를 넣으면 같이 볼 수 있어요",
      "코드를 아는 사람만 기록을 보니 가족에게만 알려주세요",
    ],
    tone: "grape",
    deco: ["🎂", "📅", "🏠", "✨", "🧭", "💜"],
  },
  {
    emoji: "🎁",
    eyebrow: "덤으로",
    title: "시판 이유식 체험팩, 안 놓치게",
    body: `베베쿡·짱죽·로하스밀 같은 브랜드 ${SAMPLE_BRANDS.length}곳의 체험팩 오픈 시각을 모아뒀어요. 자정, 아침 9시, 저녁 8시 10분… 선착순이라 시각을 놓치면 하루를 기다려요.`,
    bullets: [
      "다음에 열리는 브랜드가 맨 위에, 몇 분 남았는지와 함께",
      "받을 수 있는 월령·비용이 보이고, 우리 아기 월령에 맞으면 표시돼요",
      "아이폰 캘린더에 구독하면 오픈 몇 분 전에 알림이 와요",
    ],
    tone: "peach",
    deco: ["🍚", "🥣", "🍲", "⏰", "📅", "🔔"],
  },
];

export const TONE_BG: Record<Tone, string> = {
  peach: "from-peach-soft via-cream to-cream",
  mint: "from-mint-soft via-cream to-cream",
  butter: "from-butter-soft via-cream to-cream",
  berry: "from-berry-soft via-cream to-cream",
  grape: "from-grape-soft via-cream to-cream",
};

export const TONE_BLOB: Record<Tone, string> = {
  peach: "bg-peach",
  mint: "bg-mint",
  butter: "bg-butter",
  berry: "bg-berry",
  grape: "bg-grape",
};

/** 배경 이모지 6개의 자리. 글이 앉는 왼쪽 위~가운데를 피해 가장자리에 둔다 (%, 회전각) */
export const DECO_SPOTS: { x: number; y: number; r: number; s: number }[] = [
  { x: 78, y: 6, r: -12, s: 1.0 },
  { x: 94, y: 24, r: 14, s: 0.8 },
  { x: 3, y: 46, r: -8, s: 0.75 },
  { x: 97, y: 56, r: 10, s: 0.9 },
  { x: 18, y: 90, r: 6, s: 0.8 },
  { x: 72, y: 90, r: -14, s: 1.0 },
];
