"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getMealsOn } from "@/lib/queries";
import type { Reaction, Symptom, TrialStatus } from "@/lib/types";

export async function saveBaby(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const birth_date = String(form.get("birth_date") ?? "");
  if (!name || !birth_date) return;

  const id = String(form.get("id") ?? "");
  if (id) await db.from("babies").update({ name, birth_date }).eq("id", id);
  else await db.from("babies").insert({ name, birth_date });

  revalidatePath("/", "layout");
}

/**
 * 끼니 하나 기록.
 *
 * 여기서 재료의 첫 도입도 같이 처리한다 — 처음 보는 재료가 들어 있으면
 * trials 행을 만들어 그날부터 3일 관찰이 자동으로 시작된다.
 * "재료 등록"이라는 별도 화면을 두지 않는 이유: 아기 안고 한 손으로 쓰는 앱에서
 * 단계가 둘이면 두 번째는 안 하게 된다.
 */
export async function addMeal(form: FormData) {
  const date = String(form.get("date") ?? "");
  const menu = String(form.get("menu") ?? "").trim();
  if (!date || !menu) return;

  const ingredient_ids = form.getAll("ingredient_ids").map(String).filter(Boolean);
  const amountRaw = String(form.get("amount_ml") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();

  // 그날 몇 번째 끼니인지는 셀 필요 없이 기존 기록에서 이어붙인다
  const existing = await getMealsOn(date);
  const slot = existing.length + 1;

  await db.from("meals").insert({
    date,
    slot,
    menu,
    amount_ml: amountRaw ? Number(amountRaw) : null,
    reaction: (String(form.get("reaction") ?? "good") as Reaction),
    ingredient_ids,
    note: note || null,
  });

  if (ingredient_ids.length) {
    // 이미 있는 재료는 건드리지 않는다 (첫 도입일이 뒤로 밀리면 3일 관찰이 리셋된다)
    const { data: known } = await db
      .from("trials")
      .select("ingredient_id")
      .in("ingredient_id", ingredient_ids);
    const seen = new Set((known ?? []).map((r) => r.ingredient_id as string));
    const fresh = ingredient_ids.filter((id) => !seen.has(id));
    if (fresh.length) {
      await db.from("trials").insert(fresh.map((id) => ({ ingredient_id: id, first_date: date })));
    }
  }

  revalidatePath("/", "layout");
}

export async function deleteMeal(form: FormData) {
  const id = String(form.get("id") ?? "");
  if (id) await db.from("meals").delete().eq("id", id);
  revalidatePath("/", "layout");
}

/** 이상반응 기록 / 안전 확정 / 관찰중으로 되돌리기 */
export async function setTrialStatus(form: FormData) {
  const ingredient_id = String(form.get("ingredient_id") ?? "");
  if (!ingredient_id) return;

  const status = String(form.get("status") ?? "testing") as TrialStatus;
  const symptoms = form.getAll("symptoms").map(String) as Symptom[];
  const note = String(form.get("note") ?? "").trim();

  await db
    .from("trials")
    .update({ status, symptoms, note: note || null })
    .eq("ingredient_id", ingredient_id);

  revalidatePath("/", "layout");
}
