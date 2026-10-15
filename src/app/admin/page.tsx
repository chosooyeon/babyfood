import Link from "next/link";
import { cookies } from "next/headers";
import { LogOut, RefreshCw } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { ko } from "date-fns/locale";
import { Card } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, ME_COOKIE, isAdmin, isMe } from "@/lib/admin-auth";
import { track } from "@/lib/track";
import { SAMPLE_BY_ID } from "@/data/samples";
import AdminLogin from "./AdminLogin";
import Shell from "./Shell";
import Slides from "@/components/Slides";
import VisitsChart from "./VisitsChart";
import DeviceList, { type Device } from "./DeviceList";
import { adminLogout, setMeDevice } from "./actions";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

/** supabase/admin.sql 의 admin_stats() 가 돌려주는 모양 */
type Stats = {
  db_bytes: number;
  tables: { name: string; rows: number; bytes: number; last: string | null }[];
  visits_by_day: { day: string; n: number; devices: number; mine?: number }[];
  devices_7d: Device[];
  latency_7d: { avg: number | null; p95: number | null; max: number | null };
  recent: { ts: string; path: string; device: string | null; ip_hash: string | null; duration_ms: number | null; mine?: boolean }[];
  /** 체험팩 클릭 (브랜드별). admin.sql 을 다시 안 돌린 DB 는 없다 */
  clicks?: ClickRow[];
  clicks_by_day?: { day: string; n: number; devices: number; mine?: number }[];
  generated_at: string;
};
type ClickRow = {
  brand_id: string;
  total: number;
  d7: number;
  today: number;
  households: number;
  cal: number;
  mine: number;
  last: string | null;
};

type Load =
  | { kind: "ok"; stats: Stats; ping: number }
  | { kind: "nosql"; message: string; ping: number }
  | { kind: "down"; message: string; ping: number };

/** Supabase 무료 플랜 한도. 넘으면 읽기 전용이 된다. */
const FREE_DB_LIMIT = 500 * 1024 * 1024;

async function load(): Promise<Load> {
  const t0 = Date.now();
  try {
    const { data, error } = await db.rpc("admin_stats");
    const ping = Date.now() - t0;
    if (error) {
      const missing = /admin_stats|PGRST202|visits/.test(error.message);
      return { kind: missing ? "nosql" : "down", message: error.message, ping };
    }
    return { kind: "ok", stats: data as Stats, ping };
  } catch (e) {
    return { kind: "down", message: e instanceof Error ? e.message : String(e), ping: Date.now() - t0 };
  }
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b > 10 * 1024 * 1024 ? 0 : 1)}MB`;
const ago = (iso: string | null) =>
  iso ? formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ko }) : "없음";
const hostOf = (url: string | undefined) => (url ? url.replace(/^https?:\/\//, "") : "(미설정)");

export default async function AdminPage() {
  await track("/admin");
  const key = process.env.ADMIN_KEY;

  if (!key) {
    return (
      <Shell>
        <Card className="mt-10">
          <h1 className="text-lg font-extrabold">관리 화면이 꺼져 있어요</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <code className="rounded bg-sand px-1">ADMIN_KEY</code> 환경변수를 넣어야 열려요. 로컬은{" "}
            <code className="rounded bg-sand px-1">.env.local</code>, 배포는 Vercel 환경변수에 추가하고
            다시 배포하세요.
          </p>
        </Card>
      </Shell>
    );
  }

  const ok = await isAdmin((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );
  }

  const result = await load();
  const me = await isMe((await cookies()).get(ME_COOKIE)?.value);
  const env = {
    host: hostOf(process.env.SUPABASE_URL),
    region: process.env.VERCEL_REGION ?? "local",
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "dev",
    node: process.version,
  };

  const connection = (
    <Card className={result.kind === "ok" ? "border-mint/40 bg-mint-soft" : "border-berry/40 bg-berry-soft"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted">Supabase 연결</p>
          <p className="mt-0.5 text-base font-extrabold">
            {result.kind === "ok" ? "정상" : result.kind === "nosql" ? "연결됨 · 관리용 SQL 미실행" : "연결 실패"}
          </p>
        </div>
        <Link href="/admin" className="rounded-full bg-card p-2 text-muted" aria-label="새로고침">
          <RefreshCw size={16} />
        </Link>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted">응답</dt>
        <dd className="font-semibold">{result.ping}ms</dd>
        <dt className="text-muted">DB 주소</dt>
        <dd className="truncate font-semibold">{env.host}</dd>
        <dt className="text-muted">서버</dt>
        <dd className="font-semibold">
          v{APP_VERSION} · Vercel {env.region} · {env.commit} · Node {env.node}
        </dd>
      </dl>
      {result.kind !== "ok" ? (
        <p className="mt-3 rounded-2xl bg-card px-3 py-2 font-mono text-[11px] leading-relaxed break-all text-berry">
          {result.message}
        </p>
      ) : null}
      {result.kind === "down" ? (
        <p className="mt-3 text-xs leading-relaxed text-ink/80">
          주소를 찾지 못하거나(ENOTFOUND, fetch failed) 응답이 없으면 Supabase 프로젝트가{" "}
          <b>일시중지(Paused)</b>된 경우가 대부분이에요. 무료 플랜은 1주일 안 쓰면 멈춰요.
          supabase.com 대시보드 → 프로젝트 → <b>Restore project</b>. 90일을 넘기면 복구 버튼이
          사라지니 서두르세요.
        </p>
      ) : null}
      {result.kind === "nosql" ? (
        <p className="mt-3 text-xs leading-relaxed text-ink/80">
          Supabase SQL Editor 에서 <code className="rounded bg-card px-1">supabase/admin.sql</code> 을
          한 번 실행하면 방문 기록 테이블과 통계 함수가 생겨요.
        </p>
      ) : null}
    </Card>
  );

  const meCard = (
    <Card className="mt-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">이 기기</p>
          <p className="mt-0.5 text-sm font-extrabold">{me ? "나로 표시 중" : "남처럼 집계 중"}</p>
        </div>
        <form action={setMeDevice}>
          <input type="hidden" name="on" value={me ? "0" : "1"} />
          <SubmitButton className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-ink">
            {me ? "표시 끄기" : "나로 표시"}
          </SubmitButton>
        </form>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted [word-break:keep-all]">
        ‘나’인 기기에서 연 화면과 누른 체험팩 링크는 통계에서 빠지고 <b>나</b> 표시가 붙어요. 표시를 켜는 순간 이
        기기가 전에 남긴 기록도 전부 ‘나’로 바뀌어요. 관리 키로 들어오면 자동으로 ‘나’가 돼요 — 폰에서도 /admin 에
        한 번 들어오세요. 로컬·프리뷰 서버는 항상 ‘나’예요.
      </p>
    </Card>
  );

  return (
    <Shell
      tab="status"
      right={
        <form action={adminLogout}>
          <SubmitButton className="gap-1 text-xs font-semibold text-muted">
            <LogOut size={14} /> 잠금
          </SubmitButton>
        </form>
      }
    >
      {result.kind === "ok" ? (
        <Dashboard stats={result.stats} connection={connection} meCard={meCard} />
      ) : (
        <>
          {connection}
          {meCard}
        </>
      )}
    </Shell>
  );
}

/** 현황을 다섯 장으로 — 한눈에 · 방문 · 체험팩 · 속도·용량 · 최근 */
function Dashboard({ stats, connection, meCard }: { stats: Stats; connection: React.ReactNode; meCard: React.ReactNode }) {
  const today = stats.visits_by_day.at(-1);
  const week = stats.visits_by_day.slice(-7).reduce((a, d) => a + d.n, 0);
  const meals = stats.tables.find((t) => t.name === "meals");
  const dbRatio = stats.db_bytes / FREE_DB_LIMIT;
  const p95 = stats.latency_7d.p95;
  const slow = p95 !== null && p95 > 3000;
  const heavy = dbRatio > 0.8;
  const verdict = heavy ? "DB 용량 주의" : slow ? "응답이 느려요" : "여유 있어요";
  const verdictTone = heavy || slow ? "text-berry" : "text-mint";
  const clickSum = (stats.clicks ?? []).reduce((s, r) => s + r.total, 0);

  const slides = [
    {
      id: "overview",
      title: "한눈에",
      emoji: "👀",
      content: (
        <>
          {connection}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Tile label="과부하 판정" value={verdict} valueClass={verdictTone} sub="용량 80% 또는 p95 3초 기준" />
            <Tile label="DB 용량" value={mb(stats.db_bytes)} sub={`무료 한도 500MB 의 ${(dbRatio * 100).toFixed(1)}%`}>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-peach-soft">
                <div
                  className={`h-full rounded-full ${heavy ? "bg-berry" : "bg-peach"}`}
                  style={{ width: `${Math.max(1, Math.min(100, dbRatio * 100))}%` }}
                />
              </div>
            </Tile>
            <Tile
              label="오늘 방문"
              value={`${today?.n ?? 0}회`}
              sub={`기기 ${today?.devices ?? 0}대 · 7일 ${week}회${today?.mine ? ` · 나 ${today.mine}회 제외` : ""}`}
            />
            <Tile label="체험팩 클릭" value={`${clickSum}회`} sub={stats.clicks ? "지금까지 · 내 기기 제외" : "admin.sql 다시 실행"} />
            <Tile label="끼니 기록" value={`${meals?.rows ?? 0}끼`} sub={`마지막 ${ago(meals?.last ?? null)}`} />
            <Tile label="응답 p95 · 7일" value={p95 === null ? "–" : `${Math.round(p95)}ms`} valueClass={slow ? "text-berry" : ""} sub="1초 아래면 좋아요" />
          </div>
          {meCard}
        </>
      ),
    },
    {
      id: "visits",
      title: "방문",
      emoji: "👣",
      content: (
        <>
          <Card>
            <h2 className="text-sm font-extrabold">최근 14일 방문</h2>
            <p className="mt-0.5 text-[11px] text-muted">화면을 연 횟수. 저장·삭제 같은 동작과 내 기기는 뺐어요.</p>
            <div className="mt-3">
              <VisitsChart days={stats.visits_by_day} />
            </div>
          </Card>
          <Card className="mt-3">
            <h2 className="text-sm font-extrabold">누가 쓰고 있나 · 7일</h2>
            <p className="mt-0.5 text-[11px] text-muted">
              기기 번호는 IP 를 해시한 앞자리예요. 같은 번호면 같은 집(네트워크)에서 온 거예요. 내 기기는 맨 뒤에
              회색으로, 횟수도 따로 세요.
            </p>
            <DeviceList devices={stats.devices_7d} />
          </Card>
        </>
      ),
    },
    {
      id: "clicks",
      title: "체험팩",
      emoji: "🎁",
      content: (
        <Card>
          <h2 className="text-sm font-extrabold">체험팩 링크 클릭</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            /samples 에서 ‘사이트 열기’를 누른 횟수. 내 기기·봇은 뺐고, 90일 뒤에도 지우지 않아요.
          </p>
          {!stats.clicks || !stats.clicks_by_day ? (
            <p className="mt-3 rounded-2xl bg-butter-soft px-3 py-2 text-xs leading-relaxed text-ink/80">
              클릭 표가 아직 없어요. Supabase SQL Editor 에서{" "}
              <code className="rounded bg-card px-1">supabase/admin.sql</code> 을 다시 실행하세요.
            </p>
          ) : (
            <>
              <div className="mt-3">
                <VisitsChart days={stats.clicks_by_day} label="최근 14일 체험팩 클릭" subLabel="집" subUnit="곳" />
              </div>
              <ClicksTable rows={stats.clicks} />
            </>
          )}
        </Card>
      ),
    },
    {
      id: "health",
      title: "속도·용량",
      emoji: "⚡",
      content: (
        <>
          <Card>
            <h2 className="text-sm font-extrabold">서버 응답 속도 · 7일</h2>
            <p className="mt-0.5 text-[11px] text-muted">화면을 그리기 시작해서 다 보내기까지. 1초 아래면 좋아요.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="평균" ms={stats.latency_7d.avg} />
              <Metric label="p95" ms={stats.latency_7d.p95} />
              <Metric label="최대" ms={stats.latency_7d.max} />
            </div>
          </Card>
          <Card className="mt-3">
            <h2 className="text-sm font-extrabold">테이블</h2>
            <table className="mt-3 w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] text-muted">
                  <th className="pb-2 font-semibold">이름</th>
                  <th className="pb-2 text-right font-semibold">행</th>
                  <th className="pb-2 text-right font-semibold">용량</th>
                  <th className="pb-2 text-right font-semibold">마지막 기록</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {stats.tables.map((t) => (
                  <tr key={t.name} className="border-t border-line">
                    <td className="py-2 font-bold">{t.name}</td>
                    <td className="py-2 text-right">{t.rows.toLocaleString()}</td>
                    <td className="py-2 text-right">{mb(t.bytes)}</td>
                    <td className="py-2 text-right text-muted">{ago(t.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      ),
    },
    {
      id: "recent",
      title: "최근",
      emoji: "🕒",
      content: (
        <Card>
          <h2 className="text-sm font-extrabold">최근 동작 30건</h2>
          {stats.recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted">아직 기록이 없어요.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {stats.recent.map((r, i) => (
                <li key={i} className={`flex items-center justify-between gap-3 py-2 text-xs ${r.mine ? "opacity-60" : ""}`}>
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {r.mine ? <MeBadge /> : null}
                      {r.path.startsWith("action:") ? (
                        <span className="mr-1 rounded bg-grape-soft px-1 py-px text-[10px] text-grape">동작</span>
                      ) : null}
                      {r.path.replace("action:", "")}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {r.device ?? "알 수 없음"} · #{r.ip_hash?.slice(0, 6) ?? "------"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <p className="font-semibold">{r.duration_ms ?? "–"}ms</p>
                    <p className="text-[11px] text-muted">{ago(r.ts)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ),
    },
  ];

  return (
    <>
      <Slides slides={slides} />
      <p className="mt-4 text-center text-[11px] text-muted">
        집계 {ago(stats.generated_at)} · 방문 기록은 90일 지나면 자동 삭제
      </p>
    </>
  );
}

/** 방문·동작 목록에서 내 기기 표시 */
function MeBadge() {
  return <span className="mr-1 rounded bg-sky-soft px-1 py-px text-[10px] font-bold text-ink">나</span>;
}

/** 브랜드별 클릭 — 많이 눌린 순. 클릭이 하나도 없는 브랜드도 0 으로 보여 준다 */
function ClicksTable({ rows }: { rows: ClickRow[] }) {
  const byId = new Map(rows.map((r) => [r.brand_id, r]));
  const all = [...SAMPLE_BY_ID.values()].map((b) => ({
    brand: b,
    row: byId.get(b.id) ?? { brand_id: b.id, total: 0, d7: 0, today: 0, households: 0, cal: 0, mine: 0, last: null },
  }));
  all.sort((a, b) => b.row.total - a.row.total || b.row.mine - a.row.mine);
  const sum = rows.reduce((s, r) => s + r.total, 0);
  const sumMine = rows.reduce((s, r) => s + r.mine, 0);
  return (
    <>
      <p className="mt-3 text-xs font-bold">
        전체 {sum.toLocaleString()}회
        {sumMine ? <span className="font-semibold text-muted"> · 나 {sumMine}회는 따로</span> : null}
      </p>
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr className="text-left text-[11px] text-muted">
            <th className="pb-2 font-semibold">브랜드</th>
            <th className="pb-2 text-right font-semibold">전체</th>
            <th className="pb-2 text-right font-semibold">7일</th>
            <th className="pb-2 text-right font-semibold">집</th>
            <th className="pb-2 text-right font-semibold">알림</th>
            <th className="pb-2 text-right font-semibold text-ink/60">나</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {all.map(({ brand, row }) => (
            <tr key={brand.id} className="border-t border-line">
              <td className="py-2">
                <p className="font-bold">
                  {brand.emoji} {brand.name}
                </p>
                <p className="text-[10px] text-muted">마지막 {ago(row.last)}</p>
              </td>
              <td className="py-2 text-right font-bold">{row.total}</td>
              <td className="py-2 text-right">{row.d7}</td>
              <td className="py-2 text-right">{row.households}</td>
              <td className="py-2 text-right">{row.cal}</td>
              <td className="py-2 text-right text-muted">{row.mine}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[10px] leading-relaxed text-muted">
        집 = 서로 다른 수첩 코드 수 · 알림 = 캘린더 알림에서 눌러 들어온 수 · 나 = 내 기기에서 누른 수(전체에 안 들어감)
      </p>
    </>
  );
}

function Tile({
  label,
  value,
  sub,
  valueClass = "",
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tracking-tight ${valueClass}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted">{sub}</p> : null}
      {children}
    </Card>
  );
}

function Metric({ label, ms }: { label: string; ms: number | null }) {
  const tone = ms === null ? "text-muted" : ms > 3000 ? "text-berry" : ms > 1000 ? "text-butter" : "text-mint";
  return (
    <div className="rounded-2xl bg-sand px-2 py-3">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-extrabold tabular-nums ${tone}`}>{ms === null ? "–" : `${Math.round(ms)}`}</p>
      <p className="text-[10px] text-muted">ms</p>
    </div>
  );
}
