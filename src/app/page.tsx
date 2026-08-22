import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import Screen from "@/components/Screen";
import { Card, SectionTitle, Empty, Bar } from "@/components/ui";
import MealSheet from "@/components/MealSheet";
import TrialSheet from "@/components/TrialSheet";
import { getBaby, getMealsOn, getTrials } from "@/lib/queries";
import { deleteMeal, setTrialStatus } from "./actions";
import { dayCount, daysToNextStage, monthsOld, stageOf, today } from "@/lib/stage";
import { buildStates, recommend, watching, progress } from "@/lib/derive";
import { BY_ID } from "@/data/ingredients";
import { OBSERVE_DAYS, REACTION_META } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const baby = await getBaby();

  if (!baby) {
    return (
      <Screen>
        <Card className="text-center">
          <div className="text-4xl">🍼</div>
          <h1 className="mt-3 text-lg font-extrabold">먼저 아기를 등록해주세요</h1>
          <p className="mt-1 text-sm text-muted">생년월일만 있으면 나머지는 자동이에요.</p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-2xl bg-peach px-6 py-3 font-bold text-white"
          >
            등록하러 가기
          </Link>
        </Card>
      </Screen>
    );
  }

  const at = today();
  const months = monthsOld(baby.birth_date, at);
  const stage = stageOf(months);
  const next = daysToNextStage(baby.birth_date, at);

  const [trials, meals] = await Promise.all([getTrials(), getMealsOn(at)]);
  const states = buildStates(trials, months, at);
  const observing = watching(states);
  const suggestions = recommend(states);
  const { done, total } = progress(states);

  return (
    <Screen>
      {/* ── 인사 카드 ── */}
      <section className="rounded-blob bg-gradient-to-b from-peach-soft to-cream p-5">
        <p className="text-xs font-bold text-muted">
          {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          {baby.name} · D+{dayCount(baby.birth_date, at)}
        </h1>
        {stage ? (
          <>
            <p className="mt-1 text-sm font-semibold text-ink/70">
              생후 {months}개월 · {stage.emoji} {stage.label} 이유식
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="rounded-full bg-card px-3 py-1.5">{stage.meals}</span>
              <span className="rounded-full bg-card px-3 py-1.5">{stage.texture}</span>
              <span className="rounded-full bg-card px-3 py-1.5">1회 {stage.amount}</span>
            </div>
            {next && next.days <= 14 ? (
              <p className="mt-3 text-xs font-semibold text-grape">
                {next.days}일 뒤 {next.stage.emoji} {next.stage.label}로 넘어가요
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-1 text-sm font-semibold text-ink/70">
            생후 {months}개월 · 아직 이유식 전이에요 (보통 만 4~6개월에 시작)
          </p>
        )}
      </section>

      {/* ── 관찰중 ── */}
      {observing.length > 0 ? (
        <div className="mt-4 space-y-2">
          {observing.map((s) => {
            const passed = OBSERVE_DAYS - s.observeLeft;
            return (
              <Card key={s.ingredient.id} className="border-butter/40 bg-butter-soft">
                <div className="flex items-center justify-between">
                  <b className="text-sm">
                    {s.ingredient.emoji} {s.ingredient.name} 관찰 {passed + 1}일차
                  </b>
                  <span className="text-[11px] font-bold text-butter">
                    {s.observeLeft}일 남음
                  </span>
                </div>
                <div className="mt-2">
                  <Bar value={(passed + 1) / OBSERVE_DAYS} tone="butter" />
                </div>
                <p className="mt-2 text-xs text-ink/70">
                  관찰이 끝날 때까지 새 재료는 쉬어가요. 이상이 있으면 바로 기록하세요.
                </p>
                <div className="mt-3 flex gap-2">
                  <form action={setTrialStatus} className="flex-1">
                    <input type="hidden" name="ingredient_id" value={s.ingredient.id} />
                    <input type="hidden" name="status" value="safe" />
                    <button className="w-full rounded-xl bg-mint py-2.5 text-xs font-bold text-white">
                      괜찮아요 👍
                    </button>
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

      {/* ── 오늘 먹은 것 ── */}
      <SectionTitle right={meals.length > 0 ? `${meals.length}끼` : undefined}>
        오늘 먹은 것
      </SectionTitle>

      {meals.length === 0 ? (
        <Empty emoji="🥄">아직 오늘 기록이 없어요</Empty>
      ) : (
        <ul className="space-y-2">
          {meals.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-muted">{m.slot}끼</p>
                    <p className="truncate text-[15px] font-extrabold">{m.menu}</p>
                    <p className="mt-1 text-sm">
                      {m.ingredient_ids.map((id) => BY_ID.get(id)?.emoji ?? "•").join(" ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg">{REACTION_META[m.reaction].emoji}</p>
                    {m.amount_ml ? (
                      <p className="text-xs font-bold text-muted">{m.amount_ml}ml</p>
                    ) : null}
                  </div>
                </div>
                {m.note ? <p className="mt-2 text-xs text-muted">{m.note}</p> : null}
                <form action={deleteMeal} className="mt-2 text-right">
                  <input type="hidden" name="id" value={m.id} />
                  <button className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <Trash2 size={12} /> 삭제
                  </button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <MealSheet
        date={at}
        info={{
          tried: states.filter((s) => s.trial).map((s) => s.ingredient.id),
          allowed: states.filter((s) => s.allowed && !s.ingredient.banned).map((s) => s.ingredient.id),
        }}
        watchingNames={observing.map((s) => s.ingredient.name)}
      />

      {/* ── 다음 재료 추천 ── */}
      <SectionTitle
        right={
          <Link href="/ingredients" className="flex items-center gap-0.5">
            {done}/{total} 깸 <ChevronRight size={13} />
          </Link>
        }
      >
        다음에 시도해볼 재료
      </SectionTitle>

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
    </Screen>
  );
}
