/**
 * `npm run setup`
 *
 * .env.local 을 채우고, 그 값이 진짜 되는지 Supabase 에 물어본다.
 * 이 스크립트를 만든 이유: 키가 틀렸을 때 앱은 그냥 빈 화면만 보여주고
 * 원인을 안 알려준다. 여기서 미리 걸러야 헤매지 않는다.
 *
 * service_role 키는 터미널에만 남고 .env.local(git 제외)에만 쓰인다.
 */
import { createInterface } from "node:readline/promises";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const FILE = ".env.local";
const KEYS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const PLACEHOLDER = /^(https:\/\/xxx|eyJhbGciOi\.\.\.|change-me$)/;

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  bad: (s) => `\x1b[31m${s}\x1b[0m`,
  warn: (s) => `\x1b[33m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const HINTS = {
  SUPABASE_URL: "Supabase → Project Settings → API → Project URL  (https://....supabase.co)",
  SUPABASE_SERVICE_ROLE_KEY: "같은 화면의 service_role 키  (anon 아님! 'secret' 이라고 적혀 있는 쪽)",
};

const env = existsSync(FILE) ? parseEnv(await readFile(FILE, "utf8")) : {};
const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log(`\n${c.b("이유식 수첩 셋업")}\n`);

for (const key of KEYS) {
  const cur = env[key] ?? "";
  const filled = cur && !PLACEHOLDER.test(cur);
  if (filled) {
    const shown = key.includes("KEY") ? `${cur.slice(0, 6)}…` : cur;
    console.log(`${c.ok("✔")} ${key} ${c.dim(`= ${shown}`)}`);
    const again = await rl.question(c.dim("   바꿀까요? (엔터=그대로) "));
    if (!again.trim()) continue;
    env[key] = again.trim();
  } else {
    console.log(`${c.warn("○")} ${c.b(key)}\n  ${c.dim(HINTS[key])}`);
    let v = "";
    while (!v) v = (await rl.question("  > ")).trim();
    env[key] = v;
  }
}
rl.close();

// URL 오타는 흔하다 — 붙여넣을 때 끝에 / 나 공백이 딸려온다
env.SUPABASE_URL = env.SUPABASE_URL.replace(/\/+$/, "");

await writeFile(
  FILE,
  KEYS.map((k) => `${k}=${env[k]}`).join("\n") + "\n"
);
console.log(`\n${c.ok("✔")} ${FILE} 저장됨\n`);

// ── 실제로 되는지 확인 ────────────────────────────────
console.log(c.b("연결 확인 중…\n"));

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(env.SUPABASE_URL)) {
  console.log(`${c.bad("✘")} SUPABASE_URL 형식이 이상해요: ${env.SUPABASE_URL}`);
  console.log(`  ${c.dim("https://프로젝트id.supabase.co 모양이어야 해요")}\n`);
  process.exit(1);
}

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let failed = false;
for (const table of ["babies", "meals", "trials"]) {
  const { error } = await db.from(table).select("*", { count: "exact", head: true });
  if (!error) {
    console.log(`${c.ok("✔")} ${table} 테이블 확인`);
    continue;
  }
  failed = true;
  const msg = error.message ?? "";
  if (/Invalid API key|JWT/i.test(msg)) {
    console.log(`${c.bad("✘")} 키가 거부됐어요 — ${c.b("service_role")} 키가 맞는지 확인해주세요`);
    console.log(`  ${c.dim("anon 키를 넣으면 RLS 때문에 이렇게 막힙니다")}`);
    break;
  }
  // 주소 자체에 못 닿는 경우 — 오타이거나 프로젝트가 잠든 것
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(msg)) {
    console.log(`${c.bad("✘")} ${env.SUPABASE_URL} 에 연결할 수 없어요`);
    console.log(`  ${c.dim("· Project URL 을 잘못 붙여넣었는지 확인해주세요")}`);
    console.log(`  ${c.dim("· 무료 프로젝트는 한동안 안 쓰면 잠들어요 — Supabase 대시보드를 열어 깨우세요")}`);
    console.log(`  ${c.dim("· 인터넷 연결도 확인")}`);
    break;
  }
  if (/does not exist|schema cache|Could not find the table/i.test(msg)) {
    console.log(`${c.bad("✘")} ${table} 테이블이 없어요`);
    console.log(`  ${c.dim("Supabase → SQL Editor 에 supabase/schema.sql 을 붙여넣고 Run 해주세요")}`);
    break;
  }
  console.log(`${c.bad("✘")} ${table}: ${msg}`);
}

if (failed) process.exit(1);

const { count } = await db.from("babies").select("*", { count: "exact", head: true });
console.log(
  `\n${c.ok("전부 준비됐어요.")} ${c.dim(
    count ? `(아기 ${count}명 등록됨)` : "(아직 아기 등록 전 — 앱 설정 탭에서 등록하세요)"
  )}`
);
console.log(`\n  ${c.b("npm run dev")} ${c.dim("→ http://localhost:3100")}\n`);
