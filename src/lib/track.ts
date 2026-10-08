import "server-only";
import { after } from "next/server";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * 방문 한 건을 visits 테이블에 남긴다 — /admin 이 읽는 유일한 사용 기록.
 *
 * after() 로 응답이 나간 뒤에 쓰므로 화면 속도에는 영향이 없고,
 * 테이블이 없거나 DB 가 죽어 있어도 조용히 넘어간다. 모니터링이 본 기능을
 * 깨뜨리면 안 되기 때문이다.
 *
 * IP 는 그대로 저장하지 않고 ADMIN_KEY 로 소금 친 해시 앞 12자리만 남긴다.
 * "같은 기기인지"만 알면 되고, 누구인지는 알 필요가 없다.
 */
export async function track(path: string) {
  const startedAt = Date.now();
  let ua = "";
  let ip = "";
  try {
    const h = await headers();
    ua = h.get("user-agent") ?? "";
    ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  } catch {
    return;
  }
  const device = deviceOf(ua);

  after(async () => {
    try {
      const ip_hash = ip ? await shortHash(ip) : null;
      await db.from("visits").insert({
        path,
        device,
        ua: ua.slice(0, 300),
        ip_hash,
        duration_ms: Date.now() - startedAt,
      });
    } catch {
      /* 모니터링 실패는 무시 */
    }
  });
}

/** UA 문자열을 사람이 읽는 한 줄로. 아이폰 홈 화면 앱은 UA 에 Safari 토큰이 없다. */
export function deviceOf(ua: string): string {
  if (!ua) return "알 수 없음";
  if (/vercel-screenshot|bot|spider|crawler|curl|wget|python-requests/i.test(ua)) return "봇·도구";
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Macintosh/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : "기타";
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /CriOS|Chrome/.test(ua)
      ? "Chrome"
      : /FxiOS|Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : (os === "iPhone" || os === "iPad") && /AppleWebKit/.test(ua)
            ? "홈화면 앱"
            : "";
  return browser ? `${os} · ${browser}` : os;
}

async function shortHash(s: string): Promise<string> {
  const salt = process.env.ADMIN_KEY ?? "babyfood";
  const bytes = new TextEncoder().encode(`${salt}::${s}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .slice(0, 6)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
