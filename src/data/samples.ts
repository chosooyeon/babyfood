/**
 * 시판 이유식 체험팩 신청 시간표 + 체험팩 내용.
 *
 * 브랜드마다 신청이 열리는 시각이 다르고 선착순이 많아, 시간을 놓치면 하루를 기다린다.
 * 오픈 시각은 맘카페 제보(2026-10-11)를 옮긴 것이라 바뀔 수 있다 — 화면에 출처 날짜를
 * 그대로 보여주고, 틀리면 /samples 의 제보 폼으로 받는다.
 *
 * 월령·구성·비용은 2026-10-12 에 공식 홈·판매 페이지에서 읽은 것. 체험 조건은 자주 바뀌니
 * 확인이 안 된 항목은 비워 두고(화면에서 숨겨짐), 추측해서 채우지 않는다.
 *
 * url 은 공식 홈페이지(2026-10-11 접속 확인). 체험팩 전용 페이지는 자주 바뀌어 깨지므로
 * 홈으로 보내고, 거기서 "체험팩"을 찾게 한다.
 */

export type OpenRule =
  | { kind: "always" } // 상시 신청 가능 / 회원가입 쿠폰
  | { kind: "daily"; time: string; weekdaysOnly?: boolean } // 매일 HH:MM (KST)
  | { kind: "weekly"; weekday: number; time: string }; // 0=일 … 6=토

export type SampleBrand = {
  id: string;
  name: string;
  emoji: string;
  url: string;
  rule: OpenRule;
  /** 선착순 인원 */
  limit?: number;
  /** 한 줄 안내 — 규칙으로 못 담는 조건 */
  note?: string;

  // ── 체험팩 내용 (없으면 화면에서 그 줄이 빠진다) ──
  /** 받을 수 있는 월령 — 사람이 읽는 글 "4~8개월 (초기1~중기1)" */
  months?: string;
  /** 추천 월령 하한·상한(개월). 아기 월령과 비교해 "지금 맞아요" 배지를 띄운다 */
  fromMonth?: number;
  toMonth?: number;
  /** 뭐가 오는지 "단계별 2팩" */
  includes?: string;
  /** 얼마인지 "무료 · 배송비 3,000원" */
  price?: string;
  /** 조건 "신규회원 · 가족당 1회" */
  conditions?: string;
};

export const SAMPLES_SOURCE = "2026-10-11 맘카페 제보";
export const SAMPLES_INFO_CHECKED = "2026-10-12";

/** 하루에 한 집이 보낼 수 있는 제보 수. 폼이 공개돼 있어 스팸으로 무료 DB 가 차는 걸 막는다. */
export const TIPS_PER_DAY = 10;

export const SAMPLE_BRANDS: SampleBrand[] = [
  {
    id: "bebecook",
    name: "베베쿡",
    emoji: "🍚",
    url: "https://www.bebecook.com/",
    rule: { kind: "daily", time: "00:00" },
    limit: 90,
    months: "생후 100~240일 (초기1·1.5·2, 중기1)",
    fromMonth: 4,
    toMonth: 8,
    includes:
      "단계별 1~2팩 (초기1 140g 1팩, 초기2 150g 2팩). 네 단계 중 하나만",
    price: "무료 · 보냉가방 4,000원",
    conditions:
      "주문 이력 없는 신규회원 · 가족당 1회 · 광고수신 동의 필수 · 단계별 인원(초기1 40·초기1.5 10·초기2 20·중기1 20)",
  },
  {
    id: "babybon",
    name: "베이비본죽",
    emoji: "🥣",
    url: "https://boncaremall.com/",
    rule: { kind: "daily", time: "00:00" },
    limit: 100,
    months: "초기~완료기 단계별",
    includes: "단계별 2팩",
    price: "무료 · 배송비 3,000원",
    conditions: "매일 100명 · 체험 후 본주문 할인",
  },
  {
    id: "jjangjuk",
    name: "짱죽",
    emoji: "🍲",
    url: "https://www.jjangjuk.com/",
    rule: { kind: "daily", time: "09:00" },
    limit: 60,
    months: "미음 5개월~ · 죽 8개월~ · 진밥 11개월~ · 아기밥 13개월~",
    fromMonth: 5,
    includes: "2팩 (메뉴 골라서)",
    price: "1,950원 (정가 7,000원)",
    conditions: "주문 마감 매일 오전 10시 · 회원가입 3,000P",
  },
  {
    id: "alvins",
    name: "엘빈즈",
    emoji: "🥕",
    url: "https://www.alvins.co.kr/",
    rule: { kind: "daily", time: "10:00" },
    months: "초기1 4개월~ … 완료기 13개월+ (단계 골라서)",
    fromMonth: 4,
    includes: "2팩 (클래식·한우듬뿍·슈퍼핏·실온 중 택)",
    price: "3,000원 (정가 7,900원) · 배송비 무료",
    conditions: "ID당 1회 · 쿠폰 적용 불가 · 자주 품절",
  },
  {
    id: "ecomom",
    name: "에코맘의 산골이유식",
    emoji: "🌾",
    url: "https://ecomommeal.co.kr/",
    rule: { kind: "weekly", weekday: 5, time: "10:00" },
    months: "중기 7개월~ · 후기 9개월~ · 완료기 12개월~ (실온)",
    fromMonth: 7,
    includes: "신규고객 새출발 2팩 맛보기",
    conditions: "신규회원 · 3만원 이상 무료배송",
  },
  {
    id: "lohasmeal",
    name: "로하스밀",
    emoji: "🥬",
    url: "https://lohasmeal.com/",
    rule: { kind: "daily", time: "20:10", weekdaysOnly: true },
    months: "초기 4~6 · 중기 7~8 · 후기 9~11 · 완료기 12~14개월",
    fromMonth: 4,
    toMonth: 14,
    price: "무료 (배송비는 신청 화면에서 확인)",
    conditions: "평일 오후 8시 10분 선착순 · 놓치면 골라담기 2팩부터 구매 가능",
  },
  {
    id: "lusol",
    name: "루솔",
    emoji: "🍠",
    url: "https://www.lusol.co.kr/",
    rule: { kind: "always" },
    note: "회원가입하면 쿠폰이 자동 발급돼요",
    months: "초기~완료기 5단계",
    includes: "3팩 맛보기 세트 (한우 1팩 포함)",
    price: "맛보기 세트 8,900원 (정가 14,500원) · 앱 설치 쿠폰 1,000원",
  },
  {
    id: "cle",
    name: "푸드케어 클레",
    emoji: "🫙",
    url: "https://www.foodcare-cle.com/",
    rule: { kind: "always" },
    note: "회원가입하면 쿠폰이 자동 발급돼요",
    months: "준비기 4개월~ · 초기 4~6 · 중기 7~8 · 후기 9~14 · 영양식 15개월~",
    fromMonth: 4,
    includes: "이유식&유아식 2일 식단 체험 세트 (유리병)",
    price: "체험 세트 8,300원 · 무료체험은 2024년 5월 종료",
    conditions: "신규회원 쿠폰은 홈에서 확인",
  },
  {
    id: "yummimeal",
    name: "얌이밀",
    emoji: "🍛",
    url: "https://m.yummimeal.com/main/html.php?htmid=proc%2Fexperience.html",
    rule: { kind: "always" },
    note: "언제든 신청 가능",
    months: "1단계 미음 ~ 4단계 완료기 (2단계 7개월~, 3단계 12개월~)",
    includes: "체험단 신청 → 맞춤 이유식 택배로 받아 시식 후 구매",
    price: "무료 (배송비·구성은 신청 화면에서 확인)",
  },
];

export const SAMPLE_BY_ID = new Map(SAMPLE_BRANDS.map((b) => [b.id, b]));
