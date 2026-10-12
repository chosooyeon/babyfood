import "server-only";
import { db, must } from "./db";
import { getHousehold } from "./household";

export type Tip = {
  id: number;
  household: string;
  brand: string;
  detail: string;
  url: string | null;
  done: boolean;
  created_at: string;
};

/**
 * 이 집이 "신청함"으로 체크한 브랜드 id 들.
 * 테이블이 아직 없으면(schema.sql 을 다시 안 돌린 옛 DB) null — 시간표는 DB 없이도 보여줄 수 있으니
 * 화면 전체를 "연결 실패"로 만들지 않고 체크 버튼만 숨긴다.
 */
export async function getSampleClaims(): Promise<Set<string> | null> {
  const hh = await getHousehold();
  const res = await db
    .from("sample_claims")
    .select("brand_id")
    .eq("household", hh);
  if (res.error && /schema cache|PGRST205/.test(res.error.message)) return null;
  const rows = must<{ brand_id: string }[]>(res) ?? [];
  return new Set(rows.map((r) => r.brand_id));
}

/** /admin/tips 용 — 최신순, 처리 안 한 것 먼저 */
export async function getTips(limit = 200): Promise<Tip[]> {
  return (
    must<Tip[]>(
      await db
        .from("tips")
        .select("*")
        .order("done")
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}
