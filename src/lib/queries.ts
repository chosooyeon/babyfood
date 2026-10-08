import "server-only";
import { db, must } from "./db";
import type { Baby, Meal, Trial } from "./types";

export async function getBaby(): Promise<Baby | null> {
  return must<Baby | null>(
    await db.from("babies").select("*").order("created_at").limit(1).maybeSingle()
  );
}

export async function getTrials(): Promise<Trial[]> {
  return must<Trial[]>(await db.from("trials").select("*").order("first_date", { ascending: false })) ?? [];
}

export async function getMealsOn(date: string): Promise<Meal[]> {
  return must<Meal[]>(await db.from("meals").select("*").eq("date", date).order("slot")) ?? [];
}

/** 기록 탭용 — 최근 것부터 */
export async function getRecentMeals(limit = 120): Promise<Meal[]> {
  return (
    must<Meal[]>(
      await db
        .from("meals")
        .select("*")
        .order("date", { ascending: false })
        .order("slot", { ascending: false })
        .limit(limit)
    ) ?? []
  );
}
