import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키를 쓰는 서버 전용 클라이언트.
 * 이 파일은 "server-only" 때문에 클라이언트 컴포넌트에서 import 하면
 * 빌드가 깨진다 — 키가 번들에 실려 나가는 사고를 컴파일 단계에서 막는 것.
 *
 * fetch 에 타임아웃을 건 이유: Supabase 가 멈춰 있으면(무료 플랜은 1주일
 * 안 쓰면 일시중지된다) 연결이 몇 초씩 매달린다. 그동안 화면은 아무 말이
 * 없고, 끝나면 "데이터 없음"처럼 보인다. 빨리 실패해서 error.tsx 가 뜨게 한다.
 */
const TIMEOUT_MS = 6000;

export const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
    },
  }
);

export class DbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DbError";
  }
}

/**
 * supabase-js 는 실패해도 throw 하지 않고 { error } 를 돌려준다.
 * 그걸 그대로 두면 "연결 실패"가 "기록 없음"으로 둔갑하므로 여기서 던진다.
 */
export function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new DbError(res.error.message);
  return res.data as T;
}
