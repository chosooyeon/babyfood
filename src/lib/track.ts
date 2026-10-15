import "server-only";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "./db";
import { isMe, ME_COOKIE } from "./admin-auth";
import { getHousehold } from "./household";

/**
 * 방문 한 건을 visits 테이블에 남긴다 — /admin 이 읽는 유일한 사용 기록.
 *
 * after() 로 응답이 나간 뒤에 쓰므로 화면 속도에는 영향이 없고,
 * 테이블이 없거나 DB 가 죽어 있어도 조용히 넘어간다. 모니터링이 본 기능을
 * 깨뜨리면 안 되기 때문이다.
 *
 * IP 는 그대로 저장하지 않고 ADMIN_KEY 로 소금 친 해시 앞 12자리만 남긴다.
 * "같은 기기인지"만 알면 되고, 누구인지는 알 필요가 없다.
 *
 * mine: 내 기기에서 온 것. /admin 에 로그인한 기기(bf_me 쿠키)와 로컬·프리뷰 서버는
 * 전부 mine 이라 /admin 통계에서 빠진다. 내가 테스트하느라 누른 게 숫자를 부풀리면 안 된다.
 */
export async function track(path: string) {
  const startedAt = Date.now();
  let req: Req;
  try {
    req = await readRequest();
  } catch {
    return;
  }
  // 봇·크롤러는 기록하지 않는다 — 무료 DB 용량을 남이 채우게 두지 않는다
  if (req.bot) return;

  after(async () => {
    try {
      const row = {
        path,
        device: req.device,
        ua: req.ua.slice(0, 200),
        ip_hash: req.ip ? await shortHash(req.ip) : null,
        duration_ms: Date.now() - startedAt,
      };
      const res = await db.from("visits").insert({ ...row, mine: req.mine });
      // admin.sql 을 아직 다시 안 돌린 DB 는 mine 열이 없다 — 방문 기록이 통째로 끊기면 안 되니 열 없이 다시
      if (res.error && /mine/.test(res.error.message)) await db.from("visits").insert(row);
    } catch {
      /* 모니터링 실패는 무시 */
    }
  });
}

/**
 * 체험팩 링크 클릭 한 건 (/go/{brand}). 응답(리다이렉트)이 나간 뒤에 쓴다.
 * 업체와 이야기할 때 꺼낼 숫자라 테이블이 따로고(sample_clicks) 지우지 않는다.
 * 수첩 코드는 "몇 집이 눌렀나"를 세기 위해 같이 남긴다 — 쿠키가 없으면 null.
 */
export async function recordClick(brandId: string, src: "samples" | "cal") {
  let req: Req;
  try {
    req = await readRequest();
  } catch {
    return;
  }
  if (req.bot) return;
  const household = await getHousehold().catch(() => null);

  after(async () => {
    try {
      await db.from("sample_clicks").insert({
        brand_id: brandId,
        src,
        household,
        device: req.device,
        ip_hash: req.ip ? await shortHash(req.ip) : null,
        mine: req.mine,
      });
    } catch {
      /* 집계 실패는 무시 — 사용자는 이미 공식 홈으로 넘어갔다 */
    }
  });
}

/**
 * 이 기기를 "나"로 표시할 때 — 같은 기기(기기 종류 + IP 해시)가 남긴 과거 방문·클릭도 전부 mine 으로 바꾼다.
 * 표시가 생기기 전 기록이 남처럼 세어지면 "내가 오늘 다 들어간 건데 왜 안 줄어" 가 된다.
 * 로컬 개발(IP 없음)은 ip_hash null 인 행을 잡는다.
 */
export async function markThisDeviceMine() {
  let req: Req;
  try {
    req = await readRequest();
  } catch {
    return;
  }
  const ip_hash = req.ip ? await shortHash(req.ip) : null;
  for (const table of ["visits", "sample_clicks"] as const) {
    try {
      let q = db.from(table).update({ mine: true }).eq("device", req.device).eq("mine", false);
      q = ip_hash ? q.eq("ip_hash", ip_hash) : q.is("ip_hash", null);
      await q;
    } catch {
      /* 테이블이 없으면(옛 DB) 넘어간다 */
    }
  }
}

type Req = { ua: string; ip: string; device: string; bot: boolean; mine: boolean };

/** 요청 헤더·쿠키에서 기록에 쓸 것만 꺼낸다. 요청 밖(빌드 등)에서 부르면 throw */
async function readRequest(): Promise<Req> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const ua = h.get("user-agent") ?? "";
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const device = deviceOf(ua);
  const mine = (await isMe(c.get(ME_COOKIE)?.value)) || !isProduction();
  return { ua, ip, device, bot: device === BOT, mine };
}

/** Vercel 프로덕션 배포에서만 true. 로컬 npm run dev / npm start, 프리뷰 배포는 전부 "내 것" */
function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/** UA 문자열을 사람이 읽는 한 줄로. 아이폰 홈 화면 앱은 UA 에 Safari 토큰이 없다. */
const BOT = "봇·도구";

export function deviceOf(ua: string): string {
  if (!ua) return "알 수 없음";
  // facebookexternalhit = 페북·인스타·카톡이 링크 미리보기를 만들려고 긁는 것. 사람이 아닌데 하루 수백 건이 찍혔다
  if (/vercel-screenshot|vercel-favicon|bot|spider|crawler|curl|wget|python-requests|headless|externalhit|kakaotalk-scrap|scrap/i.test(ua)) return BOT;
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
