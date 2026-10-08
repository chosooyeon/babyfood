import "server-only";

/**
 * /admin 전용 잠금. 앱 본체는 비밀번호가 없지만, 사용 기록과 DB 상태를 보여주는
 * 관리 화면은 아무나 열면 안 되므로 ADMIN_KEY 하나로 막는다.
 * 쿠키에는 키 자체가 아니라 해시를 넣고, 경로를 /admin 으로 한정한다.
 */
export const ADMIN_COOKIE = "bf_admin";
export const ADMIN_COOKIE_PATH = "/admin";

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
