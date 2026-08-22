/**
 * 재료 사전 — 추천과 도장깨기 그리드의 원본.
 *
 * ⚠ 여기 적힌 `startMonth` 는 식약처·대한소아과학회가 공개한 일반 지침을
 *   정리한 값이고 (`source: "표준"`), 특정 이유식 책의 내용이 아니다.
 *   책을 보면서 고칠 때는 값만 바꾸지 말고 source 도 같이 바꾼다:
 *
 *     { id: "brocoli", startMonth: 7, source: "○○이유식 p.87" }
 *
 *   화면에 출처가 그대로 뜨기 때문에, 나중에 "이 월령 어디서 봤더라"가 안 생긴다.
 *   책과 표준이 다르면 책을 따르되 source 를 남겨서 근거를 잃지 않는다.
 *
 * 알레르기 위험도(risk)는 "늦게 먹이라"는 뜻이 아니다. 현재 지침은 고위험
 * 식품도 미루지 말고 도입하되 **하나씩 3일 간격으로** 관찰하라는 쪽이다.
 * 이 앱이 3일 관찰을 강제하는 이유가 그것.
 */

export type Category =
  | "곡류"
  | "채소"
  | "과일"
  | "육류"
  | "어류"
  | "콩·유제품"
  | "기타";

/** 알레르기 유발 빈도. 도입 시기가 아니라 "관찰을 얼마나 조심히 할지" */
export type Risk = "low" | "mid" | "high";

export type Ingredient = {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  /** 이 재료를 먹여도 되는 최소 월령(개월) */
  startMonth: number;
  risk: Risk;
  /** 조리·도입 팁 한 줄 */
  tip?: string;
  /** 이 월령 이전에는 절대 금지인 재료의 사유 (있으면 화면이 빨갛게 경고) */
  banned?: string;
  source: string;
};

const STD = "표준";

export const INGREDIENTS: Ingredient[] = [
  // ── 곡류 ────────────────────────────────────────────
  { id: "rice", name: "쌀", emoji: "🍚", category: "곡류", startMonth: 4, risk: "low", tip: "10배죽부터. 첫 이유식은 거의 항상 쌀미음.", source: STD },
  { id: "sweet-rice", name: "찹쌀", emoji: "🍙", category: "곡류", startMonth: 6, risk: "low", tip: "쌀보다 끈적해 삼키기 어려울 수 있다.", source: STD },
  { id: "oat", name: "오트밀", emoji: "🥣", category: "곡류", startMonth: 6, risk: "low", tip: "철분이 많다. 곱게 갈아서.", source: STD },
  { id: "potato", name: "감자", emoji: "🥔", category: "곡류", startMonth: 5, risk: "low", tip: "삶아 으깨면 초기부터 가능.", source: STD },
  { id: "sweet-potato", name: "고구마", emoji: "🍠", category: "곡류", startMonth: 5, risk: "low", tip: "단맛이 강해 다른 채소를 거부하게 될 수 있다.", source: STD },
  { id: "corn", name: "옥수수", emoji: "🌽", category: "곡류", startMonth: 8, risk: "mid", tip: "껍질을 꼭 제거.", source: STD },
  { id: "wheat", name: "밀 (국수·빵)", emoji: "🍜", category: "곡류", startMonth: 7, risk: "high", tip: "글루텐. 소량부터 3일 관찰.", source: STD },
  { id: "quinoa", name: "퀴노아", emoji: "🌾", category: "곡류", startMonth: 8, risk: "low", source: STD },

  // ── 채소 ────────────────────────────────────────────
  { id: "zucchini", name: "애호박", emoji: "🥒", category: "채소", startMonth: 5, risk: "low", tip: "초기 채소로 가장 무난. 껍질·씨 제거.", source: STD },
  { id: "pumpkin", name: "단호박", emoji: "🎃", category: "채소", startMonth: 5, risk: "low", tip: "달아서 잘 먹는다. 변비에 도움.", source: STD },
  { id: "broccoli", name: "브로콜리", emoji: "🥦", category: "채소", startMonth: 6, risk: "low", tip: "꽃 부분만. 줄기는 후기에.", source: STD },
  { id: "cauliflower", name: "콜리플라워", emoji: "🥬", category: "채소", startMonth: 6, risk: "low", source: STD },
  { id: "carrot", name: "당근", emoji: "🥕", category: "채소", startMonth: 6, risk: "low", tip: "충분히 익혀야 질감이 안 남는다.", source: STD },
  { id: "cabbage", name: "양배추", emoji: "🥬", category: "채소", startMonth: 6, risk: "low", tip: "가스가 찰 수 있어 소량부터.", source: STD },
  { id: "bokchoy", name: "청경채", emoji: "🌿", category: "채소", startMonth: 6, risk: "low", tip: "잎만 사용.", source: STD },
  { id: "onion", name: "양파", emoji: "🧅", category: "채소", startMonth: 6, risk: "low", tip: "익히면 단맛이 나 국물용으로 좋다.", source: STD },
  { id: "radish", name: "무", emoji: "🥗", category: "채소", startMonth: 6, risk: "low", source: STD },
  { id: "napa", name: "배추", emoji: "🥬", category: "채소", startMonth: 6, risk: "low", tip: "잎 부분만.", source: STD },
  { id: "spinach", name: "시금치", emoji: "🍃", category: "채소", startMonth: 7, risk: "mid", tip: "질산염 때문에 7개월 이후·소량 권장.", source: STD },
  { id: "beet", name: "비트", emoji: "🫑", category: "채소", startMonth: 8, risk: "mid", tip: "질산염. 변이 붉어져도 놀라지 말 것.", source: STD },
  { id: "mallow", name: "아욱", emoji: "🌿", category: "채소", startMonth: 7, risk: "low", source: STD },
  { id: "chard", name: "근대", emoji: "🌿", category: "채소", startMonth: 7, risk: "low", source: STD },
  { id: "mushroom", name: "표고버섯", emoji: "🍄", category: "채소", startMonth: 7, risk: "mid", tip: "아주 곱게 다져야 한다.", source: STD },
  { id: "cucumber", name: "오이", emoji: "🥒", category: "채소", startMonth: 7, risk: "low", tip: "껍질·씨 제거.", source: STD },
  { id: "paprika", name: "파프리카", emoji: "🫑", category: "채소", startMonth: 8, risk: "low", tip: "껍질 제거.", source: STD },
  { id: "eggplant", name: "가지", emoji: "🍆", category: "채소", startMonth: 8, risk: "low", source: STD },
  { id: "pea", name: "완두콩", emoji: "🫛", category: "채소", startMonth: 7, risk: "mid", tip: "껍질 제거 후 으깬다.", source: STD },
  { id: "beansprout", name: "콩나물", emoji: "🌱", category: "채소", startMonth: 9, risk: "mid", tip: "머리 떼고 줄기만 잘게.", source: STD },
  { id: "seaweed", name: "미역", emoji: "🌊", category: "채소", startMonth: 7, risk: "low", tip: "염분을 충분히 빼고 잘게.", source: STD },
  { id: "gim", name: "김", emoji: "🍙", category: "채소", startMonth: 9, risk: "low", tip: "반드시 무염·무유탕.", source: STD },
  { id: "tomato", name: "토마토", emoji: "🍅", category: "채소", startMonth: 7, risk: "mid", tip: "껍질·씨 제거. 산도 때문에 입 주변이 붉어질 수 있다.", source: STD },

  // ── 과일 ────────────────────────────────────────────
  { id: "apple", name: "사과", emoji: "🍎", category: "과일", startMonth: 5, risk: "low", tip: "익혀서 으깨면 초기부터.", source: STD },
  { id: "pear", name: "배", emoji: "🍐", category: "과일", startMonth: 5, risk: "low", tip: "변비에 도움.", source: STD },
  { id: "banana", name: "바나나", emoji: "🍌", category: "과일", startMonth: 6, risk: "low", tip: "생으로 으깨서 가능.", source: STD },
  { id: "avocado", name: "아보카도", emoji: "🥑", category: "과일", startMonth: 6, risk: "low", tip: "지방이 풍부. 잘 익은 것만.", source: STD },
  { id: "blueberry", name: "블루베리", emoji: "🫐", category: "과일", startMonth: 7, risk: "low", tip: "통째로는 질식 위험. 으깬다.", source: STD },
  { id: "strawberry", name: "딸기", emoji: "🍓", category: "과일", startMonth: 8, risk: "mid", source: STD },
  { id: "peach", name: "복숭아", emoji: "🍑", category: "과일", startMonth: 7, risk: "mid", tip: "껍질 제거.", source: STD },
  { id: "melon", name: "참외", emoji: "🍈", category: "과일", startMonth: 8, risk: "low", source: STD },
  { id: "watermelon", name: "수박", emoji: "🍉", category: "과일", startMonth: 8, risk: "low", tip: "씨 제거.", source: STD },
  { id: "mango", name: "망고", emoji: "🥭", category: "과일", startMonth: 8, risk: "mid", source: STD },
  { id: "tangerine", name: "귤", emoji: "🍊", category: "과일", startMonth: 9, risk: "mid", tip: "속껍질까지 제거.", source: STD },
  { id: "plum", name: "자두", emoji: "🫐", category: "과일", startMonth: 8, risk: "low", source: STD },
  { id: "grape", name: "포도", emoji: "🍇", category: "과일", startMonth: 9, risk: "low", tip: "통알은 질식 1순위. 반드시 4등분+씨 제거.", source: STD },
  { id: "kiwi", name: "키위", emoji: "🥝", category: "과일", startMonth: 9, risk: "mid", source: STD },

  // ── 육류 ────────────────────────────────────────────
  { id: "beef", name: "소고기 (안심)", emoji: "🥩", category: "육류", startMonth: 6, risk: "low", tip: "철분 때문에 초기에 반드시 넣는다. 핏물 빼고 삶아 곱게.", source: STD },
  { id: "chicken", name: "닭고기 (안심)", emoji: "🍗", category: "육류", startMonth: 7, risk: "low", tip: "껍질·지방 제거.", source: STD },
  { id: "pork", name: "돼지고기 (안심)", emoji: "🥓", category: "육류", startMonth: 8, risk: "low", tip: "기름기 없는 부위만.", source: STD },

  // ── 어류 ────────────────────────────────────────────
  { id: "whitefish", name: "흰살생선 (대구·광어)", emoji: "🐟", category: "어류", startMonth: 7, risk: "high", tip: "가시를 손으로 한 번 더 확인.", source: STD },
  { id: "salmon", name: "연어", emoji: "🍣", category: "어류", startMonth: 8, risk: "high", source: STD },
  { id: "anchovy", name: "멸치", emoji: "🐟", category: "어류", startMonth: 9, risk: "high", tip: "육수용. 염분을 우려낸다.", source: STD },
  { id: "shrimp", name: "새우", emoji: "🦐", category: "어류", startMonth: 9, risk: "high", tip: "갑각류. 소량부터 3일 관찰 필수.", source: STD },
  { id: "clam", name: "조개", emoji: "🦪", category: "어류", startMonth: 10, risk: "high", source: STD },
  { id: "crab", name: "게", emoji: "🦀", category: "어류", startMonth: 12, risk: "high", source: STD },

  // ── 콩·유제품 ───────────────────────────────────────
  { id: "tofu", name: "두부", emoji: "🧊", category: "콩·유제품", startMonth: 7, risk: "high", tip: "대두. 데쳐서 으깬다.", source: STD },
  { id: "blackbean", name: "검은콩", emoji: "🫘", category: "콩·유제품", startMonth: 8, risk: "high", tip: "껍질 제거 후 곱게.", source: STD },
  { id: "lentil", name: "렌틸콩", emoji: "🫘", category: "콩·유제품", startMonth: 8, risk: "mid", source: STD },
  { id: "egg-yolk", name: "달걀 노른자", emoji: "🥚", category: "콩·유제품", startMonth: 6, risk: "high", tip: "완숙 노른자부터. 흰자보다 먼저.", source: STD },
  { id: "egg-white", name: "달걀 흰자", emoji: "🍳", category: "콩·유제품", startMonth: 8, risk: "high", tip: "완전히 익혀서. 반응이 가장 흔한 재료.", source: STD },
  { id: "yogurt", name: "플레인 요거트", emoji: "🥛", category: "콩·유제품", startMonth: 8, risk: "high", tip: "무가당만. 조리용 유제품은 8개월부터 가능.", source: STD },
  { id: "cheese", name: "아기 치즈", emoji: "🧀", category: "콩·유제품", startMonth: 9, risk: "high", tip: "저염 표기 확인.", source: STD },
  { id: "milk", name: "생우유 (음용)", emoji: "🥛", category: "콩·유제품", startMonth: 12, risk: "high", banned: "12개월 전 음용 금지 — 철분 흡수를 방해하고 장출혈 위험", source: STD },

  // ── 기타 ────────────────────────────────────────────
  { id: "sesame-oil", name: "참기름", emoji: "🫗", category: "기타", startMonth: 8, risk: "mid", tip: "한 방울. 향이 강해 거부할 수 있다.", source: STD },
  { id: "perilla-oil", name: "들기름", emoji: "🫗", category: "기타", startMonth: 8, risk: "mid", source: STD },
  { id: "sesame", name: "참깨", emoji: "⚪", category: "기타", startMonth: 8, risk: "high", tip: "곱게 갈아서.", source: STD },
  { id: "peanut", name: "땅콩", emoji: "🥜", category: "기타", startMonth: 8, risk: "high", tip: "알갱이는 질식 위험. 반드시 가루·버터 형태로 묽게.", source: STD },
  { id: "walnut", name: "호두", emoji: "🌰", category: "기타", startMonth: 9, risk: "high", tip: "갈아서만.", source: STD },
  { id: "honey", name: "꿀", emoji: "🍯", category: "기타", startMonth: 12, risk: "low", banned: "12개월 전 절대 금지 — 영아 보툴리누스증", source: STD },
  { id: "salt", name: "소금·설탕", emoji: "🧂", category: "기타", startMonth: 12, risk: "low", banned: "돌 전까지 넣지 않는다 — 신장 부담·입맛 고착", source: STD },
];

export const BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

export const CATEGORIES: Category[] = [
  "곡류", "채소", "과일", "육류", "어류", "콩·유제품", "기타",
];

export const RISK_LABEL: Record<Risk, string> = {
  low: "순함",
  mid: "보통",
  high: "주의",
};
