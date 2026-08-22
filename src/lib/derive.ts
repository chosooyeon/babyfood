/**
 * 순수 계산만. 서버·클라이언트 양쪽에서 쓴다 (DB import 금지).
 */
import { INGREDIENTS, type Ingredient } from "@/data/ingredients";
import { OBSERVE_DAYS, type Trial, type TrialStatus } from "./types";
import { parseDate, today } from "./stage";

export function daysSince(ymd: string, at: string = today()): number {
  return Math.floor((parseDate(at).getTime() - parseDate(ymd).getTime()) / 86_400_000);
}

/**
 * 화면에 보여줄 실제 상태.
 *
 * DB 의 status 는 사람이 손댄 것만 기록한다 (이상반응 체크 / 수동 확인).
 * "3일이 지났으니 이제 안전"은 날짜에서 저절로 나오는 사실이라 DB 에 쓰지 않는다.
 * — 쓰기 시작하면 매일 돌려줄 배치가 필요해지고, 앱을 며칠 안 열면 썩는다.
 */
export function effectiveStatus(trial: Trial, at: string = today()): TrialStatus {
  if (trial.status === "allergic") return "allergic";
  if (trial.status === "safe") return "safe";
  return daysSince(trial.first_date, at) >= OBSERVE_DAYS ? "safe" : "testing";
}

/** 관찰이 끝나기까지 남은 일수 (끝났으면 0) */
export function observeLeft(trial: Trial, at: string = today()): number {
  return Math.max(0, OBSERVE_DAYS - daysSince(trial.first_date, at));
}

export type IngredientState = {
  ingredient: Ingredient;
  trial: Trial | null;
  /** null = 아직 안 먹여봄 */
  status: TrialStatus | null;
  /** 지금 월령에 먹여도 되는가 */
  allowed: boolean;
  observeLeft: number;
};

export function buildStates(
  trials: Trial[],
  months: number,
  at: string = today()
): IngredientState[] {
  const byIngredient = new Map(trials.map((t) => [t.ingredient_id, t]));
  return INGREDIENTS.map((ingredient) => {
    const trial = byIngredient.get(ingredient.id) ?? null;
    return {
      ingredient,
      trial,
      status: trial ? effectiveStatus(trial, at) : null,
      allowed: months >= ingredient.startMonth,
      observeLeft: trial ? observeLeft(trial, at) : 0,
    };
  });
}

/** 지금 관찰중인 재료들 — 있으면 새 재료를 하나 더 넣으면 안 된다 */
export function watching(states: IngredientState[]): IngredientState[] {
  return states.filter((s) => s.status === "testing");
}

/**
 * 다음에 시도할 재료 추천.
 *
 * 규칙은 단순하다: 아직 안 먹여봤고 + 월령이 됐고 + 금지가 아닌 것 중에서
 * ① 순한 것 먼저 ② 오래 전에 열린 재료 먼저(월령 낮은 순).
 * 관찰중인 재료가 있으면 추천을 내지 않는다 — 두 개를 같이 넣으면
 * 반응이 나왔을 때 어느 쪽인지 알 수 없고, 그게 이 앱의 존재 이유다.
 */
export function recommend(states: IngredientState[], limit = 6): IngredientState[] {
  if (watching(states).length > 0) return [];
  const rank: Record<string, number> = { low: 0, mid: 1, high: 2 };
  return states
    .filter((s) => !s.trial && s.allowed && !s.ingredient.banned)
    .sort(
      (a, b) =>
        rank[a.ingredient.risk] - rank[b.ingredient.risk] ||
        a.ingredient.startMonth - b.ingredient.startMonth ||
        a.ingredient.name.localeCompare(b.ingredient.name, "ko")
    )
    .slice(0, limit);
}

/** 도장깨기 진행률 — 지금 월령에 먹일 수 있는 것 중 몇 개를 깼나 */
export function progress(states: IngredientState[]): { done: number; total: number } {
  const open = states.filter((s) => s.allowed && !s.ingredient.banned);
  return { done: open.filter((s) => s.status === "safe").length, total: open.length };
}
