import "server-only";

/**
 * /admin 전용 잠금. 앱 본체는 비밀번호가 없지만, 사용 기록과 DB 상태를 보여주는
 * 관리 화면은 아무나 열면 안 되므로 ADMIN_KEY 하나로 막는다.
 * 쿠키에는 키 자체가 아니라 해시를 넣고, 경로를 /admin 으로 한정한다.
 */
export const ADMIN_COOKIE = "bf_admin";
export const ADMIN_COOKIE_PATH = "/admin";

/**
 * "내 기기" 표시. /admin 에 로그인한 폰·컴퓨터에 같은 해시를 경로 "/" 로도 심어서,
 * 그 기기에서 온 방문·체험팩 클릭은 mine=true 로 저장하고 통계에서 뺀다.
 * bf_admin 은 경로가 /admin 이라 /samples 나 /go 요청에는 실리지 않기 때문에 따로 둔다.
 * 잠금(로그아웃)해도 남는다 — 관리 화면을 닫은 것이지 남이 된 건 아니니까.
 */
export const ME_COOKIE = "bf_me";

export async function adminToken(key: string): Promise<string> {
  const bytes = new TextEncoder().encode(`babyfood-admin::${key}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAdmin(cookieValue: string | undefined): Promise<boolean> {
  const key = process.env.ADMIN_KEY;
  if (!key || !cookieValue) return false;
  return safeEqual(cookieValue, await adminToken(key));
}

/** bf_me 쿠키가 진짜인지 — 값이 bf_admin 과 같은 해시라 같은 함수로 검사한다 */
export const isMe = isAdmin;
