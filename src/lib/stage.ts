/** 생년월일 하나로 D+일차·개월수·이유식 단계를 전부 파생시킨다. */

export type StageId = "early" | "mid" | "late" | "final";

export type Stage = {
  id: StageId;
  label: string;
  emoji: string;
  /** 이 단계가 시작되는 월령 */
  fromMonth: number;
  /** 하루 이유식 횟수 */
  meals: string;
  /** 밥알 굵기 / 농도 */
  texture: string;
  /** 1회 분량 */
  amount: string;
  source: string;
};

const STD = "표준";

export const STAGES: Stage[] = [
  { id: "early", label: "초기", emoji: "🌱", fromMonth: 4, meals: "하루 1회", texture: "10배죽 · 갈아서 완전히 곱게", amount: "30~80ml", source: STD },
  { id: "mid", label: "중기", emoji: "🌿", fromMonth: 7, meals: "하루 2회", texture: "7배죽 · 으깬 정도", amount: "80~120ml", source: STD },
  { id: "late", label: "후기", emoji: "🍀", fromMonth: 9, meals: "하루 3회", texture: "5배죽~진밥 · 잇몸으로 으깰 굵기", amount: "120~150ml", source: STD },
  { id: "final", label: "완료기", emoji: "🌳", fromMonth: 12, meals: "하루 3회 + 간식", texture: "진밥~밥 · 어른과 비슷하게", amount: "150ml~", source: STD },
];

/** 'YYYY-MM-DD' 를 로컬 자정 Date 로. new Date('2026-01-01') 은 UTC 로 읽혀 하루 밀린다. */
export function parseDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toYMD(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function today(): string {
  return toYMD(new Date());
}

/** 태어난 날이 D+1 (한국식) */
export function dayCount(birth: string, at: string = today()): number {
  const ms = parseDate(at).getTime() - parseDate(birth).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** 만 개월수. 날짜가 안 찼으면 내림 (7월 3일생 → 8월 2일은 아직 0개월) */
export function monthsOld(birth: string, at: string = today()): number {
  const b = parseDate(birth);
  const t = parseDate(at);
  let m = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export function stageOf(months: number): Stage | null {
  if (months < STAGES[0].fromMonth) return null; // 아직 이유식 전
  return [...STAGES].reverse().find((s) => months >= s.fromMonth) ?? null;
}

/** 다음 단계까지 남은 일수 — "곧 중기예요" 안내용 */
export function daysToNextStage(birth: string, at: string = today()): { stage: Stage; days: number } | null {
  const months = monthsOld(birth, at);
  const next = STAGES.find((s) => s.fromMonth > months);
  if (!next) return null;
  const b = parseDate(birth);
  const target = new Date(b.getFullYear(), b.getMonth() + next.fromMonth, b.getDate());
  const days = Math.ceil((target.getTime() - parseDate(at).getTime()) / 86_400_000);
  return { stage: next, days };
}
