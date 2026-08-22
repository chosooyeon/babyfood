/**
 * 홈 화면 아이콘 생성. `node scripts/make-icons.mjs`
 * 아이폰 apple-touch-icon 은 PNG 만 받으므로 SVG 를 sharp 로 굽는다.
 * 모서리는 iOS 가 알아서 둥글게 깎으니 여기선 꽉 찬 사각으로 그린다.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE3D3"/>
      <stop offset="100%" stop-color="#FFC9AE"/>
    </linearGradient>
    <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FFF1E6"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#bg)"/>

  <!-- 김 -->
  <g stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" fill="none" opacity=".85">
    <path d="M212 150c-16-14 16-28 0-44"/>
    <path d="M256 138c-16-14 16-28 0-44"/>
    <path d="M300 150c-16-14 16-28 0-44"/>
  </g>

  <!-- 그릇 -->
  <path d="M112 232h288c0 84-64 140-144 140S112 316 112 232z" fill="url(#bowl)"/>
  <rect x="96" y="216" width="320" height="34" rx="17" fill="#FFFFFF"/>
  <!-- 죽 -->
  <path d="M140 250h232c-6 56-52 92-116 92s-110-36-116-92z" fill="#FFE0A8"/>

  <!-- 새싹 (초기~완료기 단계 아이콘과 같은 은유) -->
  <path d="M256 214c0-28 14-46 40-52-2 30-16 46-40 52z" fill="#6FCFA6"/>
  <path d="M256 214c0-22-11-36-32-41 2 24 13 36 32 41z" fill="#8FDCBB"/>

  <!-- 볼터치 -->
  <circle cx="186" cy="300" r="17" fill="#FFB3A0" opacity=".55"/>
  <circle cx="326" cy="300" r="17" fill="#FFB3A0" opacity=".55"/>
  <!-- 눈 -->
  <path d="M212 288c8 10 20 10 28 0" stroke="#6B4F42" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M272 288c8 10 20 10 28 0" stroke="#6B4F42" stroke-width="11" stroke-linecap="round" fill="none"/>
</svg>`;

await mkdir("public/icons", { recursive: true });
await writeFile("public/icons/icon.svg", SVG);

for (const size of [180, 192, 512]) {
  await sharp(Buffer.from(SVG)).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
// maskable: 안드로이드가 원형으로 깎아도 얼굴이 안 잘리게 여백을 준다
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#FFD9C4" },
})
  .composite([{ input: await sharp(Buffer.from(SVG)).resize(360, 360).png().toBuffer(), top: 76, left: 76 }])
  .png()
  .toFile("public/icons/maskable-512.png");

console.log("아이콘 생성 완료 → public/icons/");
