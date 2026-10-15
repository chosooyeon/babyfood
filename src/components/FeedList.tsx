import { Trash2 } from "lucide-react";
import { Empty } from "@/components/ui";
import SubmitButton from "@/components/SubmitButton";
import { deleteBottle, deleteMeal } from "@/app/actions";
import { BY_ID } from "@/data/ingredients";
import { REACTION_META, type Bottle, type Meal } from "@/lib/types";

type Entry = { kind: "meal"; time: string | null; meal: Meal } | { kind: "bottle"; time: string; bottle: Bottle };

/** 하루치 먹인 것 — 끼니와 분유를 시각순으로 섞는다. 시각 없는 옛 끼니는 끼니 순서대로 먼저. */
export default function FeedList({ meals, bottles }: { meals: Meal[]; bottles: Bottle[] }) {
  const entries: Entry[] = [
    ...meals.map((m) => ({ kind: "meal" as const, time: m.fed_at, meal: m })),
    ...bottles.map((b) => ({ kind: "bottle" as const, time: b.fed_at, bottle: b })),
  ].sort((a, b) => ((a.time ?? "") < (b.time ?? "") ? -1 : (a.time ?? "") > (b.time ?? "") ? 1 : 0));

  if (entries.length === 0) return <Empty emoji="🥄">이날은 기록이 없어요</Empty>;

  return (
    <ul className="space-y-2">
      {entries.map((e) =>
        e.kind === "bottle" ? (
          <li key={`b${e.bottle.id}`}>
            <div className="flex items-center gap-3 rounded-2xl border border-sky/30 bg-sky-soft/50 px-4 py-2.5">
              <span className="text-lg">🍼</span>
              <p className="text-sm font-bold">
                분유 <span className="ml-1 text-xs font-semibold text-muted tabular-nums">{e.bottle.fed_at}</span>
              </p>
              <p className="ml-auto text-xs font-bold text-muted">{e.bottle.amount_ml ? `${e.bottle.amount_ml}ml` : ""}</p>
              <form action={deleteBottle}>
                <input type="hidden" name="id" value={e.bottle.id} />
                <SubmitButton pendingLabel="…" className="text-muted">
                  <Trash2 size={13} />
                </SubmitButton>
              </form>
            </div>
          </li>
        ) : (
          <li key={e.meal.id}>
            <MealCard m={e.meal} />
          </li>
        ),
      )}
    </ul>
  );
}

/** 끼니도 분유 줄과 같은 한 줄 박스. 시각 · 메뉴, 오른쪽에 재료 이모지 · 반응 · 양 */
function MealCard({ m }: { m: Meal }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-peach/30 bg-peach-soft/40 px-4 py-2.5">
      <span className="text-lg">🥄</span>
      <p className="min-w-0 flex-1 truncate text-sm font-bold" title={m.note ?? undefined}>
        {m.menu}
        {m.fed_at ? <span className="ml-1.5 text-xs font-semibold text-muted tabular-nums">{m.fed_at}</span> : null}
        {m.note ? <span className="ml-1.5 text-[11px] font-normal text-muted">{m.note}</span> : null}
      </p>
      <p className="shrink-0 text-sm tracking-tight">{m.ingredient_ids.map((id) => BY_ID.get(id)?.emoji ?? "•").join("")}</p>
      <p className="shrink-0 text-xs font-bold text-muted">
        <span className="text-base">{REACTION_META[m.reaction].emoji}</span>
        {m.amount_ml ? <span className="ml-1">{m.amount_ml}ml</span> : null}
      </p>
      <form action={deleteMeal}>
        <input type="hidden" name="id" value={m.id} />
        <SubmitButton pendingLabel="…" className="text-muted">
          <Trash2 size={13} />
        </SubmitButton>
      </form>
    </div>
  );
}
