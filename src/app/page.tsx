import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Screen from "@/components/Screen";
import SubmitButton from "@/components/SubmitButton";
import { Card, SectionTitle, Empty, Bar } from "@/components/ui";
import MealSheet from "@/components/MealSheet";
import TrialSheet from "@/components/TrialSheet";
import { getBaby, getBottlesOn, getMealsOn, getTrials } from "@/lib/queries";
import { setTrialStatus } from "./actions";
import FeedClock from "@/components/FeedClock";
import BottleForm from "@/components/BottleForm";
import {
  dayCount,
  daysToNextStage,
  monthsOld,
  shortDate,
  stageOf,
  today,
} from "@/lib/stage";
import {
  buildStates,
  recommend,
  watching,
  progress,
  observeEndDate,
} from "@/lib/derive";
import { OBSERVE_DAYS } from "@/lib/types";
import { track } from "@/lib/track";
import { INGREDIENTS } from "@/data/ingredients";
import { SAMPLE_BRANDS } from "@/data/samples";

export const dynamic = "force-dynamic";

/** 제목·설명은 layout 의 기본값(SITE_TITLE) 그대로. canonical 만 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function TodayPage() {
  await track("/");
  const at = today();
  const [baby, trials, meals, bottles] = await Promise.all([
    getBaby(),
    getTrials(),
    getMealsOn(at),
    getBottlesOn(at),
  ]);

  // 아기 등록 전 — 처음 온 사람과 검색엔진이 보는 화면. 등록 버튼이 먼저, 그 아래 앱 소개.
  if (!baby) {
    return (
      <Screen>
        <Card className="text-center">
          <div className="text-4xl">🍼</div>
          <p className="mt-3 text-xs font-bold text-muted">이유식 수첩</p>
          <h1 className="mt-1 text-lg font-extrabold [word-break:keep-all]">
            새 재료는 하나씩, {OBSERVE_DAYS}일씩 지켜보는 이유식 기록
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted [word-break:keep-all]">
            아기 생년월일 하나면 이유식 단계·재료 시작 월령·알레르기 관찰이 자동이에요. 로그인 없이
            바로 시작해요.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-2xl bg-peach px-6 py-3 font-bold text-white"
          >
            아기 등록하고 시작하기
          </Link>
        </Card>

        <SectionTitle>이렇게 써요</SectionTitle>
        <ul className="space-y-2">
          {[
            ["🥄", "끼니를 적으면 관찰이 시작돼요", `처음 먹는 재료를 고르면 그날부터 ${OBSERVE_DAYS}일 관찰. 날이 지나면 저절로 ‘먹어봄’으로 바뀌어요.`],
            ["🥕", `재료 ${INGREDIENTS.length}가지 도장깨기`, "월령이 안 된 재료는 잠기고, 돌 전 금지 재료는 이유와 함께 표시. 다음에 뭘 먹일지 순한 것부터 골라줘요."],
            ["⚠️", "이상반응은 증상을 체크해 두고 병원에", "발진·구토·설사 같은 증상과 메모가 기록 탭 맨 위에 모여요."],
            ["🎁", `시판 이유식 체험팩 ${SAMPLE_BRANDS.length}곳 오픈 시간표`, "선착순 체험팩이 언제 열리는지 한 화면에. 아이폰 캘린더 알림도 돼요."],
          ].map(([emoji, title, body]) => (
            <li key={title}>
              <Card className="flex gap-3">
                <span className="text-2xl">{emoji}</span>
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold [word-break:keep-all]">{title}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted [word-break:keep-all]">{body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <Link href="/guide" className="rounded-2xl border border-line bg-card px-3 py-3">
            📖 앱 소개 카드
          </Link>
          <Link href="/ingredients" className="rounded-2xl border border-line bg-card px-3 py-3">
            🥕 재료 월령표
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted [word-break:keep-all]">
          무료 웹앱이에요. 아이폰은 Safari 공유 → ‘홈 화면에 추가’로 앱처럼 써요. 기준은 식약처·대한소아과학회
          공개 지침이고, 아기 상태는 소아과 선생님과 상의하세요.
          <br />
          <Link href="/privacy" className="underline">
            개인정보처리방침
          </Link>
          {" · "}
          <Link href="/terms" className="underline">
            이용약관
          </Link>
        </p>
      </Screen>
    );
  }

  const months = monthsOld(baby.birth_date, at);
  const stage = stageOf(months);
  const next = daysToNextStage(baby.birth_date, at);

  const states = buildStates(trials, months, at);
  const observing = watching(states);
  const suggestions = recommend(states);
  const { done, total } = progress(states);


  return (
    <Screen>
      {/* ── 인사 카드 — 이름·D+ 와 단계만. 장식 없이 */}
      <Card className="p-5">
        <p className="text-xs font-bold text-muted">
          {new Date().toLocaleDateString("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
        <div className="mt-2 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">{baby.name}</h1>
            <p className="mt-0.5 text-sm font-bold text-peach tabular-nums">
              D+{dayCount(baby.birth_date, at)} <span className="font-semibold text-muted">· 생후 {months}개월</span>
            </p>
          </div>
          {stage ? (
            <div className="flex shrink-0 flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-2xl">{stage.emoji}</span>
              <span className="mt-1 text-[11px] font-bold text-muted">{stage.label} 이유식</span>
            </div>
          ) : null}
        </div>
        {stage ? (
          <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted [word-break:keep-all]">
            {stage.meals} · {stage.texture} · 1회 {stage.amount}
            {next && next.days <= 14 ? (
              <span className="mt-1 block font-semibold text-grape">
                {next.days}일 뒤 {next.stage.emoji} {next.stage.label}로 넘어가요
              </span>
            ) : null}
          </p>
        ) : (
          <p className="mt-3 border-t border-line pt-3 text-xs text-muted">아직 이유식 전이에요 (보통 만 4~6개월에 시작)</p>
        )}
      </Card>

      {/* ── 관찰중 ── */}
      {observing.length > 0 ? (
        <div className="mt-4 space-y-2">
          {observing.map((s) => {
            const passed = OBSERVE_DAYS - s.observeLeft;
            return (
              <Card
                key={s.ingredient.id}
                className="border-butter/40 bg-butter-soft"
              >
                <div className="flex items-center justify-between">
                  <b className="text-sm">
                    {s.ingredient.emoji} {s.ingredient.name} 관찰 {passed + 1}
                    일차
                  </b>
                  <span className="text-[11px] font-bold text-butter">
                    {shortDate(observeEndDate(s.trial!))} 해제
                  </span>
                </div>
                <div className="mt-2">
                  <Bar value={(passed + 1) / OBSERVE_DAYS} tone="butter" />
                </div>
                <p className="mt-2 text-xs text-ink/70">
                  {shortDate(observeEndDate(s.trial!))}까지 새 재료는 쉬어가요.
                  이상이 있으면 바로 기록하세요.
                </p>
                <div className="mt-3 flex gap-2">
                  <form action={setTrialStatus} className="flex-1">
                    <input
                      type="hidden"
                      name="ingredient_id"
                      value={s.ingredient.id}
                    />
                    <input type="hidden" name="status" value="safe" />
                    <SubmitButton
                      pendingLabel="저장 중…"
                      className="w-full rounded-xl bg-mint py-2.5 text-xs font-bold text-white"
                    >
                      괜찮아요 👍
                    </SubmitButton>
                  </form>
                  <TrialSheet
                    ingredientId={s.ingredient.id}
                    ingredientName={s.ingredient.name}
                    emoji={s.ingredient.emoji}
                    current="testing"
                    trigger={
                      <span className="block rounded-xl bg-berry px-4 py-2.5 text-xs font-bold text-white">
                        이상반응 ⚠
                      </span>
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* ── 수유 시계 ── */}
      <SectionTitle
        right={
          <Link href="/feeds" className="flex items-center gap-0.5">
            먹인 것 보기 <ChevronRight size={13} />
          </Link>
        }
      >
        오늘 먹은 시간
      </SectionTitle>
      <Card>
        <FeedClock
          meals={meals.filter((m) => m.fed_at).map((m) => ({ time: m.fed_at!, amount: m.amount_ml }))}
          bottles={bottles.map((b) => ({ time: b.fed_at, amount: b.amount_ml }))}
        />
        <BottleForm date={at} />
      </Card>

      <MealSheet
        date={at}
        info={{
          tried: states.filter((s) => s.trial).map((s) => s.ingredient.id),
          allowed: states
            .filter((s) => s.allowed && !s.ingredient.banned)
            .map((s) => s.ingredient.id),
        }}
        watchingNames={observing.map((s) => s.ingredient.name)}
      />

      {/* ── 다음 재료 추천 ── */}
      <SectionTitle>다음에 시도해볼 재료</SectionTitle>

      {suggestions.length === 0 ? (
        <Empty emoji="⏳">
          {observing.length > 0
            ? "관찰이 끝나면 다음 재료를 추천해드릴게요"
            : "이번 단계에서 시도할 재료를 다 먹여봤어요!"}
        </Empty>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Link
              key={s.ingredient.id}
              href={`/ingredients?open=${s.ingredient.id}`}
              className="rounded-full border border-line bg-card px-4 py-2.5 text-[13px] font-bold"
            >
              {s.ingredient.emoji} {s.ingredient.name}
            </Link>
          ))}
        </div>
      )}

      {/* ── 재료 도장깨기 — 하단 탭에서 빠진 대신 여기서 들어간다 */}
      <Link
        href="/ingredients"
        className="mt-3 block rounded-blob border border-line bg-card p-4 shadow-[0_2px_10px_rgba(160,130,100,.06)] active:scale-[.99]"
      >
        <div className="flex items-center justify-between">
          <b className="text-sm">🥕 재료 도장깨기</b>
          <span className="flex items-center gap-0.5 text-xs font-bold text-muted tabular-nums">
            {done}/{total} 깸 <ChevronRight size={13} />
          </span>
        </div>
        <div className="mt-2">
          <Bar value={total ? done / total : 0} />
        </div>
        <p className="mt-2 text-xs text-muted [word-break:keep-all]">
          먹어봄 · 관찰중 · 이상반응 · 아직 안 먹어봄을 한눈에. 월령이 안 된 재료는 잠겨 있어요.
        </p>
      </Link>
    </Screen>
  );
}
