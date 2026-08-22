"use client";

import { useMemo, useState } from "react";
import { X, Plus, Search, AlertTriangle, Lock } from "lucide-react";
import { CATEGORIES, INGREDIENTS } from "@/data/ingredients";
import { REACTION_META, type Reaction } from "@/lib/types";
import { addMeal } from "@/app/actions";

/** 서버에서 내려주는 최소 정보 — 재료가 이미 도입됐는지, 월령이 됐는지 */
export type PickerInfo = { tried: string[]; allowed: string[] };

const AMOUNTS = [60, 80, 100, 120, 150, 180];

export default function MealSheet({
  date,
  info,
  watchingNames,
}: {
  date: string;
  info: PickerInfo;
  watchingNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [reaction, setReaction] = useState<Reaction>("good");
  const [amount, setAmount] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const tried = useMemo(() => new Set(info.tried), [info.tried]);
  const allowed = useMemo(() => new Set(info.allowed), [info.allowed]);

  /** 이번 끼니에서 처음 먹이는 재료 — 2개 이상이면 원인을 못 가린다 */
  const freshCount = picked.filter((id) => !tried.has(id)).length;

  const grouped = useMemo(() => {
    const q = query.trim();
    const list = INGREDIENTS.filter((i) => {
      if (q && !i.name.includes(q)) return false;
      if (!showAll && !allowed.has(i.id) && !picked.includes(i.id)) return false;
      return true;
    });
    return CATEGORIES.map((c) => [c, list.filter((i) => i.category === c)] as const).filter(
      ([, items]) => items.length > 0
    );
  }, [query, showAll, allowed, picked]);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function reset() {
    setPicked([]);
    setReaction("good");
    setAmount("");
    setQuery("");
    setShowAll(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-blob bg-peach py-4.5 text-base font-extrabold text-white shadow-[0_6px_18px_rgba(255,155,122,.4)] active:scale-[.98]"
      >
        <Plus size={20} strokeWidth={3} />
        오늘 먹인 것 기록하기
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream">
      <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + .75rem)" }}>
        <button onClick={reset} className="text-muted" aria-label="닫기">
          <X size={24} />
        </button>
        <b className="text-[15px]">끼니 기록</b>
        <span className="w-6" />
      </header>

      <form action={addMeal} onSubmit={() => setTimeout(reset, 0)} className="flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="date" value={date} />
        {picked.map((id) => (
          <input key={id} type="hidden" name="ingredient_ids" value={id} />
        ))}
        <input type="hidden" name="reaction" value={reaction} />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {watchingNames.length > 0 ? (
            <p className="mb-4 flex gap-2 rounded-2xl bg-butter-soft px-4 py-3 text-xs leading-relaxed text-ink">
              <AlertTriangle size={16} className="mt-px shrink-0 text-butter" />
              <span>
                지금 <b>{watchingNames.join(", ")}</b> 를 관찰 중이에요. 관찰이 끝날 때까지는
                새 재료를 더하지 않는 게 좋아요.
              </span>
            </p>
          ) : null}

          <label className="block">
            <span className="text-xs font-semibold text-muted">메뉴</span>
            <input
              name="menu"
              required
              placeholder="예: 소고기 브로콜리죽"
              className="mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-base outline-none focus:border-peach"
            />
          </label>

          {/* ── 반응 ── */}
          <p className="mt-5 text-xs font-semibold text-muted">얼마나 잘 먹었나요?</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(REACTION_META) as Reaction[]).map((r) => {
              const on = reaction === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReaction(r)}
                  className={`rounded-2xl border py-3 text-xs font-bold transition-colors ${
                    on ? "border-peach bg-peach-soft text-ink" : "border-line bg-card text-muted"
                  }`}
                >
                  <span className="block text-2xl">{REACTION_META[r].emoji}</span>
                  {REACTION_META[r].label}
                </button>
              );
            })}
          </div>

          {/* ── 양 ── */}
          <p className="mt-5 text-xs font-semibold text-muted">먹은 양</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  amount === String(a) ? "border-peach bg-peach-soft" : "border-line bg-card text-muted"
                }`}
              >
                {a}
              </button>
            ))}
            <input
              name="amount_ml"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="직접"
              className="w-20 rounded-full border border-line bg-card px-4 py-2 text-center text-sm outline-none focus:border-peach"
            />
            <span className="self-center text-sm text-muted">ml</span>
          </div>

          {/* ── 재료 ── */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">
              들어간 재료 {picked.length > 0 ? `· ${picked.length}개` : ""}
            </p>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-[11px] font-bold text-muted underline underline-offset-2"
            >
              {showAll ? "지금 가능한 것만" : "월령 안 된 것도 보기"}
            </button>
          </div>

          {freshCount >= 2 ? (
            <p className="mt-2 flex gap-2 rounded-2xl bg-berry-soft px-4 py-3 text-xs leading-relaxed">
              <AlertTriangle size={16} className="mt-px shrink-0 text-berry" />
              <span>
                처음 먹이는 재료가 <b>{freshCount}개</b>예요. 반응이 나와도 어느 재료 때문인지
                알 수 없어요 — 새 재료는 한 번에 하나씩이 좋아요.
              </span>
            </p>
          ) : null}

          <div className="relative mt-3">
            <Search size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="재료 검색"
              className="w-full rounded-2xl border border-line bg-card py-3 pr-4 pl-10 text-sm outline-none focus:border-peach"
            />
          </div>

          <div className="mt-3 space-y-4">
            {grouped.map(([category, items]) => (
              <section key={category}>
                <p className="mb-1.5 text-[11px] font-bold text-muted">{category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((i) => {
                    const on = picked.includes(i.id);
                    const isNew = !tried.has(i.id);
                    const locked = !allowed.has(i.id);
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => toggle(i.id)}
                        className={`flex items-center gap-1 rounded-full border px-3 py-2 text-[13px] font-semibold transition-colors ${
                          on
                            ? "border-peach bg-peach-soft text-ink"
                            : locked
                              ? "border-line bg-sand text-muted"
                              : "border-line bg-card text-ink"
                        }`}
                      >
                        <span>{i.emoji}</span>
                        {i.name}
                        {locked ? <Lock size={11} className="text-muted" /> : null}
                        {isNew && !locked ? (
                          <span className="rounded-full bg-mint px-1.5 py-px text-[9px] font-extrabold text-white">
                            처음
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="text-xs font-semibold text-muted">메모</span>
            <textarea
              name="note"
              rows={2}
              placeholder="남긴 이유, 컨디션 등"
              className="mt-1 w-full resize-none rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none focus:border-peach"
            />
          </label>
        </div>

        <div
          className="shrink-0 border-t border-line bg-card px-4 pt-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + .75rem)" }}
        >
          <button
            type="submit"
            className="w-full rounded-2xl bg-peach py-4 text-base font-extrabold text-white active:scale-[.98]"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
