import "server-only";
import { db } from "./db";
import type { Baby, Meal, Trial } from "./types";

export async function getBaby(): Promise<Baby | null> {
  const { data } = await db.from("babies").select("*").order("created_at").limit(1).maybeSingle();
  return data as Baby | null;
}

export async function getTrials(): Promise<Trial[]> {
  const { data } = await db.from("trials").select("*").order("first_date", { ascending: false });
  return (data ?? []) as Trial[];
}

export async function getMealsOn(date: string): Promise<Meal[]> {
  const { data } = await db.from("meals").select("*").eq("date", date).order("slot");
  return (data ?? []) as Meal[];
}

/** 기록 탭용 — 최근 것부터 */
export async function getRecentMeals(limit = 120): Promise<Meal[]> {
  const { data } = await db
    .from("meals")
    .select("*")
    .order("date", { ascending: false })
    .order("slot", { ascending: false })
    .limit(limit);
  return (data ?? []) as Meal[];
}
