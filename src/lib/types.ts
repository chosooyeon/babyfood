/** DB 행과 1:1 대응. supabase/schema.sql 을 고치면 여기도 같이 고친다. */

/** 아이가 재료에 보인 반응 */
export type Reaction = "good" | "soso" | "refused";

/** 재료 도입 상태 — 3일 관찰이 끝나야 safe 가 된다 */
export type TrialStatus = "testing" | "safe" | "allergic";

/** 이상 반응 종류 (체크박스) */
export type Symptom = "rash" | "vomit" | "diarrhea" | "swelling" | "cough" | "fussy";

export type Baby = {
  id: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
};

export type Meal = {
  id: string;
  date: string; // YYYY-MM-DD
  slot: number; // 그날 몇 번째 끼니 (1,2,3)
  menu: string;
  amount_ml: number | null;
  reaction: Reaction;
  /** 이 끼니에 들어간 재료 id 들 */
  ingredient_ids: string[];
  note: string | null;
  /** 먹인 시각 'HH:MM' (DB 는 HH:MM:SS 로 돌려줘 읽을 때 자른다). 1.3.0 전 기록은 null */
  fed_at: string | null;
  created_at: string;
};

/** 분유 한 번 — 수유 시계에 이유식과 같이 찍힌다 */
export type Bottle = {
  id: string;
  date: string;
  fed_at: string; // 'HH:MM'
  amount_ml: number | null;
};

export type Trial = {
  id: string;
  ingredient_id: string;
  /** 처음 먹인 날 — 여기서 3일을 센다 */
  first_date: string;
  status: TrialStatus;
  symptoms: Symptom[];
  note: string | null;
};

export const REACTION_META: Record<Reaction, { label: string; emoji: string }> = {
  good: { label: "잘 먹음", emoji: "😋" },
  soso: { label: "보통", emoji: "🙂" },
  refused: { label: "거부", emoji: "😣" },
};

export const SYMPTOM_META: Record<Symptom, { label: string; emoji: string }> = {
  rash: { label: "발진·두드러기", emoji: "🔴" },
  vomit: { label: "구토", emoji: "🤮" },
  diarrhea: { label: "설사", emoji: "💩" },
  swelling: { label: "입·눈 부음", emoji: "😮‍💨" },
  cough: { label: "기침·쌕쌕", emoji: "😷" },
  fussy: { label: "심한 보챔", emoji: "😭" },
};

/** 첫 도입 후 이 일수만큼 다른 새 재료를 넣지 않고 지켜본다 */
export const OBSERVE_DAYS = 3;
