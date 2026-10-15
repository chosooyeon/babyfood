import type { Metadata } from "next";
import { headers } from "next/headers";
import { ExternalLink, CalendarPlus, Check, Undo2 } from "lucide-react";
import Screen from "@/components/Screen";
import { Card, SectionTitle } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import {
  SAMPLE_BRANDS,
  SAMPLES_INFO_CHECKED,
  SAMPLES_SOURCE,
  type SampleBrand,
} from "@/data/samples";
import { getBaby } from "@/lib/queries";
import { monthsOld } from "@/lib/stage";
import {
  ruleLabel,
  untilLabel,
  upcomingOpenings,
  type Opening,
} from "@/lib/samples";
import { getSampleClaims } from "@/lib/samples-queries";
import { nowKST } from "@/lib/samples";
import OpenTimeline from "./OpenTimeline";

/**
 * 캘린더(webcal) 알림 — 실제로 울리는지 확인될 때까지 화면에서 숨긴다 (코드·/samples/calendar.ics 는 그대로).
 * 확인되면 true 로.
 */
const SHOW_ALARM = false;
import { track } from "@/lib/track";
import { toggleSampleClaim } from "./actions";
import Countdown from "./Countdown";
import Link from "next/link";
import AlarmSettings from "./AlarmSettings";

export const dynamic = "force-dynamic";

const BRAND_NAMES = SAMPLE_BRANDS.map((b) => b.name);
export const metadata: Metadata = {
  title: "시판 이유식 체험팩 신청 시간표",
  description: `${BRAND_NAMES.slice(0, 4).join("·")} 등 시판 이유식 ${SAMPLE_BRANDS.length}개 브랜드의 체험팩 오픈 시각·받을 수 있는 월령·비용을 한 화면에. 다음에 열리는 브랜드와 카운트다운, 아이폰 캘린더 알림까지.`,
  alternates: { canonical: "/samples" },
};

/**
 * 시판 이유식 체험팩 신청 화면.
 * 브랜드마다 오픈 시각이 달라 놓치기 쉬우니, "다음에 열리는 것"을 맨 위에 크게 보여주고
 * 나머지는 오픈 순으로 줄 세운다. 신청한 브랜드는 체크해서 아래로 내린다.
 */
export default async function SamplesPage() {
  await track("/samples");
  const [claimsOrNull, baby, h] = await Promise.all([
    getSampleClaims(),
    getBaby(),
    headers(),
  ]);
  const ready = claimsOrNull !== null;
  const claims = claimsOrNull ?? new Set<string>();
  // 아기 월령을 알면 브랜드마다 "지금 맞아요" 배지를 띄운다
  const months = baby ? monthsOld(baby.birth_date) : null;
  // 안드로이드는 webcal 구독이 안 먹는 캘린더 앱이 있어 .ics 파일 받기를 같이 보여준다
  const android = /Android/i.test(h.get("user-agent") ?? "");
  const openings = upcomingOpenings();
  const k = nowKST();
  const nowMin = k.getUTCHours() * 60 + k.getUTCMinutes();

  const timed = openings.filter((o) => !claims.has(o.brand.id));
  const always = SAMPLE_BRANDS.filter(
    (b) => b.rule.kind === "always" && !claims.has(b.id),
  );
  const claimed = SAMPLE_BRANDS.filter((b) => claims.has(b.id));

  return (
    <Screen title="체험팩 신청">
      <p className="-mt-2 mb-4 text-xs leading-relaxed text-muted">
        시판 이유식은 대부분 체험팩을 무료·할인으로 보내줘요. 선착순이 많아서
        열리는 시각을 놓치면 하루를 더 기다려야 해요.
      </p>

      {!ready ? (
        <p className="mb-4 rounded-2xl bg-butter-soft px-4 py-3 text-xs leading-relaxed text-ink/80">
          신청 체크·제보를 저장할 테이블이 아직 없어요. Supabase SQL Editor 에서{" "}
          <code className="rounded bg-card px-1">
            supabase/schema.sql
          </code>{" "}
          을 한 번 실행하세요.
        </p>
      ) : null}

      <OpenTimeline openings={timed} nowMin={nowMin} months={months} />

      <SectionTitle
        right={
          SHOW_ALARM ? (
            <a href="#alarm" className="flex items-center gap-1 text-peach">
              <CalendarPlus size={14} /> 알림 설정
            </a>
          ) : undefined
        }
      >
        오픈 시간표
      </SectionTitle>
      {timed.length === 0 ? (
        <p className="text-sm text-muted">
          시간이 정해진 브랜드는 전부 신청했어요 🎉
        </p>
      ) : (
        <Slider>
          {timed.map((o) => (
            <BrandCard key={o.brand.id} brand={o.brand} opening={o} ready={ready} months={months} />
          ))}
        </Slider>
      )}
      {always.length > 0 ? (
        <>
          <SectionTitle>언제든 신청</SectionTitle>
          <Slider>
            {always.map((b) => (
              <BrandCard key={b.id} brand={b} ready={ready} months={months} />
            ))}
          </Slider>
        </>
      ) : null}

      {claimed.length > 0 ? (
        <>
          <SectionTitle right={`${claimed.length}곳`}>신청 끝</SectionTitle>
          <Slider>
            {claimed.map((b) => (
              <BrandCard key={b.id} brand={b} claimed ready={ready} months={months} />
            ))}
          </Slider>
        </>
      ) : null}

      {SHOW_ALARM ? (
      <Card className="mt-7">
        <h2 className="text-sm font-extrabold">🔔 오픈 알림 받기</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          아이폰 캘린더에 오픈 시각을 넣고 미리 알림을 받아요. 자동 신청은 각
          쇼핑몰이 막아 둬서 못 하지만, 알림 받고 바로 열면 돼요.
        </p>
        <div className="mt-4">
          <AlarmSettings
            brands={openings.map((o) => ({
              id: o.brand.id,
              name: o.brand.name,
              emoji: o.brand.emoji,
              rule: ruleLabel(o.brand),
            }))}
            claimed={claimed.map((b) => b.id)}
            android={android}
          />
        </div>
      </Card>
      ) : null}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted [word-break:keep-all]">
        오픈 시각은 {SAMPLES_SOURCE}, 월령·구성·비용은 {SAMPLES_INFO_CHECKED} 공식 홈 기준이라 바뀌었을 수 있어요.
        <br />
        <Link href="/settings/contact?topic=체험팩 시간표" className="font-bold text-peach underline underline-offset-2">
          시간이 다르거나 빠진 브랜드 알려주기
        </Link>
      </p>
    </Screen>
  );
}

/** 아기 월령이 브랜드 권장 범위에 드는지. 범위를 모르면 null (배지 없음) */
function fit(
  brand: SampleBrand,
  months: number | null,
): "ok" | "early" | "late" | null {
  if (months === null || brand.fromMonth === undefined) return null;
  if (months < brand.fromMonth) return "early";
  if (brand.toMonth !== undefined && months > brand.toMonth) return "late";
  return "ok";
}

/**
 * 체험팩 내용 — 월령·비용은 바로 보이고, 구성·조건은 펼쳐야 보인다.
 * 아홉 장이 줄줄이 있는 화면이라 다 펼쳐 두면 시간표가 묻힌다.
 */
function PackInfo({
  brand,
  months,
}: {
  brand: SampleBrand;
  months: number | null;
}) {
  const f = fit(brand, months);
  const badge =
    f === "ok"
      ? { text: `지금 ${months}개월, 맞아요`, cls: "bg-mint-soft text-ink" }
      : f === "early"
        ? { text: `${brand.fromMonth}개월부터`, cls: "bg-sand text-muted" }
        : f === "late"
          ? {
              text: `${brand.toMonth}개월까지라 지났어요`,
              cls: "bg-sand text-muted",
            }
          : null;
  const hasMore = brand.includes || brand.conditions;
  if (!brand.months && !brand.price && !hasMore) return null;
  return (
    <div className="mt-2.5 space-y-1 text-xs">
      {brand.months ? (
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className="text-muted">👶 {brand.months}</span>
          {badge ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
            >
              {badge.text}
            </span>
          ) : null}
        </p>
      ) : null}
      {brand.price ? <p className="text-muted">💰 {brand.price}</p> : null}
      {hasMore ? (
        <details className="group">
          <summary className="cursor-pointer list-none text-[11px] font-bold text-peach">
            <span className="group-open:hidden">구성·조건 보기</span>
            <span className="hidden group-open:inline">접기</span>
          </summary>
          <div className="mt-1 space-y-1 rounded-xl bg-sand/70 px-3 py-2 leading-relaxed text-ink/80">
            {brand.includes ? <p>📦 {brand.includes}</p> : null}
            {brand.conditions ? <p>📌 {brand.conditions}</p> : null}
          </div>
        </details>
      ) : null}
    </div>
  );
}

/**
 * 옆으로 넘기는 카드 줄. 한 장이 화면의 4/5 를 차지해 다음 장이 살짝 보인다 (더 있다는 신호).
 * 스크롤 스냅만 쓰고 자바스크립트는 없다.
 */
function Slider({ children }: { children: React.ReactNode[] }) {
  const n = children.length;
  return (
    <div className="-mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children.map((c, i) => (
        <div key={i} className={`shrink-0 snap-center ${n === 1 ? "w-full" : "w-[80%]"}`}>
          {c}
        </div>
      ))}
    </div>
  );
}

function BrandCard({
  brand,
  opening,
  claimed = false,
  ready,
  months,
}: {
  brand: SampleBrand;
  opening?: Opening;
  claimed?: boolean;
  /** sample_claims 테이블이 있어서 체크를 저장할 수 있는지 */
  ready: boolean;
  months: number | null;
}) {
  return (
    <Card className={`flex h-full flex-col p-4 ${claimed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold">
            <span className="mr-1 align-middle text-2xl">{brand.emoji}</span>
            {brand.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">{ruleLabel(brand)}</p>
        </div>
        {opening ? (
          <p className="shrink-0 text-xs font-extrabold text-peach">
            <Countdown
              openAt={opening.epochMs}
              fallback={untilLabel(opening)}
            />
          </p>
        ) : null}
      </div>
      <PackInfo brand={brand} months={months} />
      <div className="mt-auto flex gap-2 pt-3">
        <a
          href={`/go/${brand.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-sand py-2.5 text-xs font-bold text-ink active:scale-[.98]"
        >
          사이트 열기 <ExternalLink size={12} />
        </a>
        {ready ? (
          <form action={toggleSampleClaim} className="flex-1">
            <input type="hidden" name="brand_id" value={brand.id} />
            {claimed ? <input type="hidden" name="claimed" value="1" /> : null}
            <SubmitButton
              className={`w-full rounded-2xl py-2.5 text-xs font-bold active:scale-[.98] ${
                claimed ? "bg-sand text-muted" : "bg-mint-soft text-ink"
              }`}
            >
              {claimed ? (
                <>
                  <Undo2 size={12} /> 되돌리기
                </>
              ) : (
                <>
                  <Check size={12} /> 신청했어요
                </>
              )}
            </SubmitButton>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
