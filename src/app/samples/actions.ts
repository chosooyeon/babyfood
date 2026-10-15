"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getHousehold } from "@/lib/household";
import { SAMPLE_BY_ID, TIPS_PER_DAY } from "@/data/samples";
import { track } from "@/lib/track";

/** "신청함" 체크를 켜고 끈다. 집(household)마다 따로, 브랜드마다 한 번. */
export async function toggleSampleClaim(form: FormData) {
  await track("action:toggleSampleClaim");
  const hh = await getHousehold();
  const brand_id = String(form.get("brand_id") ?? "");
  if (!SAMPLE_BY_ID.has(brand_id)) return;

  if (form.get("claimed") === "1") {
    await db
      .from("sample_claims")
      .delete()
      .eq("household", hh)
      .eq("brand_id", brand_id);
  } else {
    await db
      .from("sample_claims")
      .upsert(
        { household: hh, brand_id },
        { onConflict: "household,brand_id" },
      );
  }
  revalidatePath("/samples");
}

export type TipResult = { ok: true } | { ok: false; error: string };

/** 문의·제보 (/settings/contact). brand 열에는 주제가 들어간다. /admin/tips 에서 읽는다. */
export async function sendTip(
  _prev: TipResult | null,
  form: FormData,
): Promise<TipResult> {
  await track("action:sendTip");
  const hh = await getHousehold();
  const brand = String(form.get("brand") ?? "")
    .trim()
    .slice(0, 60);
  const detail = String(form.get("detail") ?? "")
    .trim()
    .slice(0, 500);
  const urlRaw = String(form.get("url") ?? "")
    .trim()
    .slice(0, 300);
  if (!brand || !detail)
    return { ok: false, error: "내용을 적어주세요." };

  let url: string | null = null;
  if (urlRaw) {
    try {
      const u = new URL(
        urlRaw.startsWith("http") ? urlRaw : `https://${urlRaw}`,
      );
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      url = u.toString();
    } catch {
      return {
        ok: false,
        error:
          "링크 주소가 이상해요. 비워 두거나 https:// 로 시작하는 주소를 넣어주세요.",
      };
    }
  }

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await db
    .from("tips")
    .select("id", { count: "exact", head: true })
    .eq("household", hh)
    .gte("created_at", since);
  if ((count ?? 0) >= TIPS_PER_DAY)
    return {
      ok: false,
      error: "오늘은 제보를 충분히 받았어요. 내일 다시 보내주세요.",
    };

  const { error } = await db
    .from("tips")
    .insert({ household: hh, brand, detail, url });
  if (error)
    return {
      ok: false,
      error: "저장하지 못했어요. 잠시 뒤 다시 시도해주세요.",
    };
  revalidatePath("/admin/tips");
  return { ok: true };
}
