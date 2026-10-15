import "server-only";
import { db, DbError, must } from "./db";
import { getHousehold } from "./household";
import type { Baby, Bottle, Meal, Trial } from "./types";
import { hhmm, monthRange } from "./stage";

/** 모든 읽기는 현재 기기의 수첩 코드로 거른다. 다른 집 기록은 아예 쿼리에 안 걸린다. */

export async function getBaby(): Promise<Baby | null> {
  const hh = await getHousehold();
  return must<Baby | null>(
    await db.from("babies").select("*").eq("household", hh).order("created_at").limit(1).maybeSingle()
  );
}

export async function getTrials(): Promise<Trial[]> {
  const hh = await getHousehold();
  return (
    must<Trial[]>(
      await db.from("trials").select("*").eq("household", hh).order("first_date", { ascending: false })
    ) ?? []
  );
}

export async function getMealsOn(date: string): Promise<Meal[]> {
  const hh = await getHousehold();
  return (
    must<Meal[]>(
      await db.from("meals").select("*").eq("household", hh).eq("date", date).order("fed_at", { nullsFirst: true }).order("slot"),
    ) ?? []
  ).map(trimMealTime);
}

/** 달력용 — 한 달치, 날짜 내림차순 (타임라인이 최근 것부터 보여준다) */
export async function getMealsInMonth(ym: string): Promise<Meal[]> {
  const hh = await getHousehold();
  const { from, to } = monthRange(ym);
  return (
    must<Meal[]>(
      await db
        .from("meals")
        .select("*")
        .eq("household", hh)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: false })
        .order("fed_at", { nullsFirst: true })
        .order("slot"),
    ) ?? []
  ).map(trimMealTime);
}

/** 오늘 분유. 테이블이 아직 없으면(schema.sql 을 안 돌린 옛 DB) 빈 목록 — 끼니 기록이 같이 죽으면 안 된다 */
export async function getBottlesOn(date: string): Promise<Bottle[]> {
  const hh = await getHousehold();
  const res = await db.from("bottles").select("*").eq("household", hh).eq("date", date).order("fed_at");
  if (res.error) {
    if (/does not exist|schema cache/i.test(res.error.message)) return [];
    throw new DbError(res.error.message);
  }
  return (res.data ?? []).map((b) => ({ ...b, fed_at: hhmm(b.fed_at)! }));
}

/** DB 의 time 은 'HH:MM:SS' — 화면·정렬 모두 'HH:MM' 으로 통일 */
function trimMealTime(m: Meal): Meal {
  return { ...m, fed_at: hhmm(m.fed_at) };
}

/** 기록 탭용 — 최근 것부터 */
export async function getRecentMeals(limit = 120): Promise<Meal[]> {
  const hh = await getHousehold();
  return (
    must<Meal[]>(
      await db
        .from("meals")
        .select("*")
        .eq("household", hh)
        .order("date", { ascending: false })
        .order("slot", { ascending: false })
        .limit(limit)
    ) ?? []
  );
}

/** 수유 탭 차트용 — 날짜 범위(양끝 포함), 날짜·시각 오름차순 */
export async function getMealsBetween(from: string, to: string): Promise<Meal[]> {
  const hh = await getHousehold();
  return (
    must<Meal[]>(
      await db.from("meals").select("*").eq("household", hh).gte("date", from).lte("date", to).order("date").order("fed_at", { nullsFirst: true }).order("slot"),
    ) ?? []
  ).map(trimMealTime);
}

export async function getBottlesBetween(from: string, to: string): Promise<Bottle[]> {
  const hh = await getHousehold();
  const res = await db.from("bottles").select("*").eq("household", hh).gte("date", from).lte("date", to).order("date").order("fed_at");
  if (res.error) {
    if (/does not exist|schema cache/i.test(res.error.message)) return [];
    throw new DbError(res.error.message);
  }
  return (res.data ?? []).map((b) => ({ ...b, fed_at: hhmm(b.fed_at)! }));
}
