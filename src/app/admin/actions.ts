"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH, adminToken, isAdmin, safeEqual } from "@/lib/admin-auth";

const YEAR = 60 * 60 * 24 * 365;

export async function adminLogin(_prev: string | null, form: FormData): Promise<string | null> {
  const key = process.env.ADMIN_KEY;
  if (!key) return "ADMIN_KEY 환경변수가 설정되지 않았어요.";

  const given = String(form.get("key") ?? "");
  if (!safeEqual(given, key)) {
    // 무차별 대입을 조금이라도 느리게
    await new Promise((r) => setTimeout(r, 800));
    return "키가 달라요.";
  }

  (await cookies()).set(ADMIN_COOKIE, await adminToken(key), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: YEAR,
    path: ADMIN_COOKIE_PATH,
  });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: ADMIN_COOKIE_PATH });
  redirect("/admin");
}

/** /admin/tips — 제보를 "반영함"으로 표시하거나 되돌린다. 관리자만. */
export async function setTipDone(form: FormData) {
  if (!(await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value))) return;
  const id = Number(form.get("id"));
  if (!Number.isInteger(id)) return;
  await db.from("tips").update({ done: form.get("done") === "1" }).eq("id", id);
  revalidatePath("/admin/tips");
}
