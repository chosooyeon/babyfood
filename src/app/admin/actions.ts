"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH, ME_COOKIE, adminToken, isAdmin, safeEqual } from "@/lib/admin-auth";
import { markThisDeviceMine } from "@/lib/track";

const YEAR = 60 * 60 * 24 * 365;
/** 400일 — 크롬이 허용하는 쿠키 수명의 상한 */
const ME_MAX_AGE = 60 * 60 * 24 * 400;

/**
 * 이 기기를 "나"로 표시하는 쿠키 (경로 /). 방문·체험팩 클릭 기록이 mine=true 가 돼 통계에서 빠진다.
 * 이 기기가 전에 남긴 기록도 같이 "나"로 바꾼다 — 안 그러면 오늘 들어온 수백 번이 남처럼 남는다.
 */
async function setMeCookie(token: string) {
  (await cookies()).set(ME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ME_MAX_AGE,
    path: "/",
  });
  await markThisDeviceMine();
}

export async function adminLogin(_prev: string | null, form: FormData): Promise<string | null> {
  const key = process.env.ADMIN_KEY;
  if (!key) return "ADMIN_KEY 환경변수가 설정되지 않았어요.";

  const given = String(form.get("key") ?? "");
  if (!safeEqual(given, key)) {
    // 무차별 대입을 조금이라도 느리게
    await new Promise((r) => setTimeout(r, 800));
    return "키가 달라요.";
  }

  const token = await adminToken(key);
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: YEAR,
    path: ADMIN_COOKIE_PATH,
  });
  // 관리 키를 아는 기기 = 내 기기. 여기서 누르는 건 통계에서 뺀다
  await setMeCookie(token);
  redirect("/admin");
}

/** /admin 현황 — 이 기기의 "나" 표시를 켜고 끈다. 끄면 이 기기도 남처럼 집계된다 */
export async function setMeDevice(form: FormData) {
  const key = process.env.ADMIN_KEY;
  if (!key || !(await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value))) return;
  if (form.get("on") === "1") await setMeCookie(await adminToken(key));
  else (await cookies()).delete({ name: ME_COOKIE, path: "/" });
  revalidatePath("/admin");
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
