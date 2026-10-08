import { db } from "@/lib/db";

/**
 * Supabase 무료 플랜은 1주일 동안 쿼리가 없으면 프로젝트를 일시중지한다.
 * vercel.json 의 cron 이 매일 이 주소를 한 번 열어 아주 작은 쿼리를 보내면 안 멈춘다.
 *
 * Vercel 은 CRON_SECRET 환경변수가 있으면 `Authorization: Bearer <값>` 을 붙여 부른다.
 * 프로덕션에서 환경변수가 없으면 아예 닫는다 — 아무나 DB 를 두드리고 에러 문구를 읽게 두지 않는다.
 * (로컬에서는 검사 없이 열어 둔다)
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (isProd && !secret) {
    return new Response("CRON_SECRET not set", { status: 503 });
  }
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const t0 = Date.now();
  const { error } = await db.from("babies").select("id").limit(1);
  const ms = Date.now() - t0;

  if (error) {
    return Response.json({ ok: false, error: error.message, ms }, { status: 503 });
  }
  return Response.json({ ok: true, ms });
}
