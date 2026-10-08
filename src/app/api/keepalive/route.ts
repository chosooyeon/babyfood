import { db } from "@/lib/db";

/**
 * Supabase 무료 플랜은 1주일 동안 쿼리가 없으면 프로젝트를 일시중지한다.
 * vercel.json 의 cron 이 매일 이 주소를 한 번 열어 아주 작은 쿼리를 보내면 안 멈춘다.
 *
 * Vercel 은 CRON_SECRET 환경변수가 있으면 `Authorization: Bearer <값>` 을 붙여 부른다.
 * 환경변수가 없으면 검사하지 않는다 — 하는 일이 한 줄 읽기라 열려 있어도 해롭지 않다.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
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
