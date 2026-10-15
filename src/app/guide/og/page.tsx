import { OBSERVE_DAYS } from "@/lib/types";
import { SITE_HOST } from "@/lib/site";

/**
 * 링크 공유 미리보기(Open Graph) 그림. 1200×630 고정.
 * scripts/make-guide-cards.mjs 가 이 화면을 Chrome 으로 찍어 public/og.png 로 만든다.
 * robots.txt 에서 막혀 있고 탭에도 없다 — 사람이 볼 화면이 아니다.
 */
export default function OgPage() {
  return (
    <div
      id="og"
      className="relative overflow-hidden bg-gradient-to-br from-peach-soft via-cream to-cream text-ink"
      style={{ width: 1200, height: 630 }}
    >
      {/* Chrome 으로 찍을 때 Next 개발 배지(N)가 왼쪽 아래에 같이 찍히지 않게. 이 화면에서만 */}
      <style>{"nextjs-portal{display:none}"}</style>
      <div
        aria-hidden
        className="absolute rounded-full bg-peach opacity-25 blur-3xl"
        style={{ width: 620, height: 420, right: -160, top: -140 }}
      />
      <div
        aria-hidden
        className="absolute rounded-full bg-mint opacity-15 blur-3xl"
        style={{ width: 520, height: 320, left: -160, bottom: -120 }}
      />
      <div className="relative flex h-full items-center px-[88px]">
        <div className="flex-1">
          <p className="text-[30px] font-bold tracking-wide text-muted">이유식 수첩</p>
          <h1 className="mt-4 text-[76px] leading-[1.15] font-extrabold tracking-tight [word-break:keep-all]">
            새 재료는 하나씩,
            <br />
            {OBSERVE_DAYS}일씩 지켜보며
          </h1>
          <p className="mt-8 text-[32px] leading-[1.5] text-ink/75 [word-break:keep-all]">
            생년월일 하나로 단계·재료·알레르기 관찰이 자동.
            <br />
            로그인 없이 바로 쓰는 무료 이유식 기록 앱
          </p>
          <p className="mt-10 text-[26px] font-bold text-muted">{SITE_HOST}</p>
        </div>
        <div className="ml-10 shrink-0 text-[300px] leading-none">🍚</div>
      </div>
    </div>
  );
}
