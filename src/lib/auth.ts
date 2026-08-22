/**
 * 나 혼자 쓰는 앱이라 계정은 없다. 비밀번호 하나로 잠그고 쿠키를 1년 준다.
 * (폰에서 한 번 로그인하면 다시 물어보지 않는다)
 *
 * Web Crypto 만 써서 proxy(edge)와 서버 액션 양쪽에서 같은 코드로 돈다.
 */
export const COOKIE = "bf_session";

export async function sessionToken(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`babyfood::${password}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 쿠키 값이 현재 APP_PASSWORD 에서 나온 것인지 */
export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await sessionToken(process.env.APP_PASSWORD ?? "");
  // 길이가 같은 hex 문자열끼리라 타이밍 차가 의미 없지만 습관대로
  if (cookieValue.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
