/**
 * 수첩 코드 — "어느 집 기록인지"를 가르는 열쇠.
 *
 * 로그인 대신 쓴다. 처음 접속한 기기마다 proxy.ts 가 무작위 코드를 쿠키로 심고,
 * babies·meals·trials 의 모든 행이 이 코드로 묶인다. 다른 기기에서 이어 쓰려면
 * 설정 탭에서 같은 코드를 입력한다.
 *
 * 12자리 · 31글자 알파벳 ≈ 59비트. 헷갈리는 글자(0/O, 1/I/L)는 뺐다.
 * proxy 와 서버 양쪽에서 쓰므로 server-only 를 걸지 않는다 (비밀값은 없다).
 */
export const HH_COOKIE = "bf_hh";
/** proxy 가 쿠키를 처음 심는 요청에서, 같은 요청의 서버 컴포넌트에 코드를 넘기는 통로 */
export const HH_HEADER = "x-bf-hh";
export const HH_LEN = 12;
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
/** 400일 — 크롬이 허용하는 쿠키 수명의 상한 */
export const HH_MAX_AGE = 60 * 60 * 24 * 400;

export function newHouseholdCode(): string {
  const bytes = new Uint8Array(HH_LEN);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s;
}

/** 사람이 친 입력을 정규화 — 소문자·하이픈·공백 허용, 0→O 같은 치환은 하지 않는다 */
export function normalizeHouseholdCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isHouseholdCode(s: string | undefined | null): s is string {
  return !!s && s.length === HH_LEN && [...s].every((ch) => ALPHABET.includes(ch));
}

/** 보여줄 때는 4자리씩 끊는다: ABCD-EFGH-JKMN */
export function formatHouseholdCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}
