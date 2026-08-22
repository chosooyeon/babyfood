"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Lock, Check, Hourglass, AlertTriangle, BookOpen } from "lucide-react";
import { CATEGORIES, RISK_LABEL } from "@/data/ingredients";
import type { IngredientState } from "@/lib/derive";
import { SYMPTOM_META, type Symptom } from "@/lib/types";
import TrialSheet from "./TrialSheet";
import { Bar, Card } from "./ui";

type Filter = "all" | "done" | "todo" | "watch" | "alert";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "done", label: "먹어봄" },
  { id: "todo", label: "아직" },
  { id: "watch", label: "관찰중" },
  { id: "alert", label: "이상반응" },
];

export default function IngredientGrid({
  states,
  months,
  initialOpen,
}: {
  states: IngredientState[];
  months: number;
  initialOpen?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(initialOpen ?? null);

  // 홈에서 "다음에 시도해볼 재료"를 눌러 들어온 경우 주소를 정리한다
  useEffect(() => {
    if (initialOpen) window.history.replaceState(null, "", "/ingredients");
  }, [initialOpen]);

  const shown = useMemo(
    () =>
      states.filter((s) => {
        if (filter === "done") return s.status === "safe";
        if (filter === "todo") return !s.trial && s.allowed;
        if (filter === "watch") return s.status === "testing";
        if (filter === "alert") return s.status === "allergic";
        return true;
      }),
    [states, filter]
  );

  const open = openId ? (states.find((s) => s.ingredient.id === openId) ?? null) : null;

  const openable = states.filter((s) => s.allowed && !s.ingredient.banned);
  const done = openable.filter((s) => s.status === "safe").length;

  return (
    <>
      <Card>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-muted">지금 먹일 수 있는 재료 중</p>
            <p className="text-2xl font-extrabold">
              🏅 {done}
              <span className="text-base text-muted"> / {openable.length}</span>
            </p>
          </div>
          <p className="text-xs font-bold text-mint">
            {openable.length ? Math.round((done / openable.length) * 100) : 0}%
          </p>
        </div>
        <div className="mt-3">
          <Bar value={openable.length ? done / openable.length : 0} />
        </div>
      </Card>

      <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold ${
              filter === f.id ? "border-peach bg-peach-soft" : "border-line bg-card text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {CATEGORIES.map((category) => {
          const items = shown.filter((s) => s.ingredient.category === category);
          if (!items.length) return null;
          return (
            <section key={category}>
              <p className="mb-2 text-[13px] font-extrabold">{category}</p>
              <div className="grid grid-cols-4 gap-2">
                {items.map((s) => (
                  <Tile key={s.ingredient.id} state={s} onOpen={() => setOpenId(s.ingredient.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {open ? <Detail state={open} months={months} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

function Tile({ state, onOpen }: { state: IngredientState; onOpen: () => void }) {
  const { ingredient: i, status, allowed } = state;
  const locked = !allowed || Boolean(i.banned);

  const skin = locked
    ? "border-line bg-sand opacity-55"
    : status === "safe"
      ? "border-mint/45 bg-mint-soft"
      : status === "testing"
        ? "border-butter/50 bg-butter-soft"
        : status === "allergic"
          ? "border-berry/45 bg-berry-soft"
          : "border-line bg-card";

  return (
    <button
      onClick={onOpen}
      className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border p-1 active:scale-95 ${skin}`}
    >
      <span className={`text-2xl ${!locked && !status ? "opacity-40 grayscale" : ""}`}>{i.emoji}</span>
      <span className="line-clamp-2 text-center text-[10px] leading-tight font-bold">{i.name}</span>

      {locked ? (
        <Lock size={11} className="absolute top-1.5 right-1.5 text-muted" />
      ) : status === "safe" ? (
        <Check size={12} strokeWidth={3.5} className="absolute top-1.5 right-1.5 text-mint" />
      ) : status === "testing" ? (
        <Hourglass size={11} className="absolute top-1.5 right-1.5 text-butter" />
      ) : status === "allergic" ? (
        <AlertTriangle size={11} className="absolute top-1.5 right-1.5 text-berry" />
      ) : null}
    </button>
  );
}

function Detail({
  state,
  months,
  onClose,
}: {
  state: IngredientState;
  months: number;
  onClose: () => void;
}) {
  const { ingredient: i, trial, status, allowed, observeLeft } = state;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/30" onClick={onClose}>
      <div
        className="w-full rounded-t-blob bg-card p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl">{i.emoji}</p>
            <h2 className="mt-1 text-lg font-extrabold">{i.name}</h2>
            <p className="text-xs font-bold text-muted">
              {i.category} · {i.startMonth}개월~ · 알레르기 {RISK_LABEL[i.risk]}
            </p>
          </div>
          <button onClick={onClose} className="text-muted" aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        {i.banned ? (
          <p className="mt-3 flex gap-2 rounded-2xl bg-berry-soft px-4 py-3 text-xs leading-relaxed font-semibold">
            <AlertTriangle size={16} className="mt-px shrink-0 text-berry" />
            {i.banned}
          </p>
        ) : !allowed ? (
          <p className="mt-3 rounded-2xl bg-sand px-4 py-3 text-xs text-muted">
            지금 {months}개월이라 아직 일러요. {i.startMonth}개월부터 시도해보세요.
          </p>
        ) : null}

        {i.tip ? (
          <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-xs leading-relaxed">💡 {i.tip}</p>
        ) : null}

        {trial ? (
          <div className="mt-3 rounded-2xl bg-cream px-4 py-3 text-xs">
            <p className="font-bold">
              {status === "safe"
                ? "✅ 안전 확인"
                : status === "testing"
                  ? `⏳ 관찰중 · ${observeLeft}일 남음`
                  : "⚠️ 이상반응 기록됨"}
            </p>
            <p className="mt-1 text-muted">처음 먹인 날 {trial.first_date}</p>
            {trial.symptoms.length > 0 ? (
              <p className="mt-1 text-berry">
                {trial.symptoms.map((s) => SYMPTOM_META[s as Symptom]?.label).filter(Boolean).join(", ")}
              </p>
            ) : null}
            {trial.note ? <p className="mt-1 text-muted">{trial.note}</p> : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">
            아직 안 먹여봤어요. 끼니를 기록할 때 이 재료를 고르면 3일 관찰이 자동으로 시작돼요.
          </p>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
          <BookOpen size={12} /> 기준 출처: {i.source}
        </p>

        {trial ? (
          <div className="mt-4">
            <TrialSheet
              ingredientId={i.id}
              ingredientName={i.name}
              emoji={i.emoji}
              current={status ?? "testing"}
              defaultSymptoms={trial.symptoms as Symptom[]}
              defaultNote={trial.note ?? ""}
              trigger={
                <span className="block w-full rounded-2xl border border-berry/50 bg-berry-soft py-3 text-center text-sm font-bold text-berry">
                  이상반응 기록하기
                </span>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
