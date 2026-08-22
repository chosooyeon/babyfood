import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키를 쓰는 서버 전용 클라이언트.
 * 이 파일은 "server-only" 때문에 클라이언트 컴포넌트에서 import 하면
 * 빌드가 깨진다 — 키가 번들에 실려 나가는 사고를 컴파일 단계에서 막는 것.
 */
export const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
