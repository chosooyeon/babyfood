import "server-only";
import { db, must } from "./db";
import { getHousehold } from "./household";
import type { Baby, Meal, Trial } from "./types";

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
    must<Meal[]>(await db.from("meals").select("*").eq("household", hh).eq("date", date).order("slot")) ??
    []
  );
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
