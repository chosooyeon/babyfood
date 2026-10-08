#!/usr/bin/env node
/**
 * /guide 소개 카드를 PNG 로 뽑는다 → public/guide/card-1.png … card-5.png
 *
 *   npm run build && npm run cards
 *
 * 빌드된 앱을 3100 포트로 띄우고, 설치된 Chrome 을 headless 로 열어 /guide/card/N 을 찍는다.
 * 폰트(Pretendard)가 CDN 에서 오므로 virtual-time-budget 으로 몇 초 기다린다.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync);
if (!CHROME) {
  console.error("Chrome 을 찾지 못했어요. /Applications 에 Google Chrome 이 있어야 해요.");
  process.exit(1);
}

const PORT = 3100;
const COUNT = 5;
const OUT = resolve("public/guide");
mkdirSync(OUT, { recursive: true });

const server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore" });
const stop = () => server.kill();
process.on("exit", stop);

for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://localhost:${PORT}/manifest.webmanifest`);
    if (r.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

for (let n = 1; n <= COUNT; n++) {
  const out = resolve(OUT, `card-${n}.png`);
  execFileSync(CHROME, [
    "--headless=new",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1080,1350",
    "--virtual-time-budget=6000",
    `--screenshot=${out}`,
    `http://localhost:${PORT}/guide/card/${n}`,
  ], { stdio: "ignore" });
  console.log("✓", out);
}
stop();
