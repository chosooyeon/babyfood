import Screen from "@/components/Screen";
import { Card } from "@/components/ui";
import { getBaby } from "@/lib/queries";
import { saveBaby } from "../actions";
import { dayCount, monthsOld, stageOf, STAGES } from "@/lib/stage";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const baby = await getBaby();
  const months = baby ? monthsOld(baby.birth_date) : 0;
  const stage = baby ? stageOf(months) : null;

  return (
    <Screen title="설정">
      <Card>
        <h2 className="text-sm font-extrabold">아기 정보</h2>
        <p className="mt-1 text-xs text-muted">
          생년월일 하나면 D+일차·개월수·이유식 단계가 전부 자동으로 계산돼요.
        </p>

        <form action={saveBaby} className="mt-4 space-y-3">
          {baby ? <input type="hidden" name="id" value={baby.id} /> : null}
          <label className="block">
            <span className="text-xs font-semibold text-muted">이름</span>
            <input
              name="name"
              defaultValue={baby?.name ?? ""}
              placeholder="예: 서연"
              className="mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none focus:border-peach"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted">생년월일</span>
            <input
              name="birth_date"
              type="date"
              defaultValue={baby?.birth_date ?? ""}
              className="mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none focus:border-peach"
            />
          </label>
          <button className="w-full rounded-2xl bg-peach py-3.5 font-bold text-white active:scale-[.98]">
            저장
          </button>
        </form>

        {baby && stage ? (
          <p className="mt-3 rounded-2xl bg-sand px-4 py-3 text-xs text-muted">
            지금 <b className="text-ink">D+{dayCount(baby.birth_date)}</b> · 생후{" "}
            <b className="text-ink">{months}개월</b> · {stage.emoji}{" "}
            <b className="text-ink">{stage.label} 이유식</b>
          </p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-extrabold">단계 기준</h2>
        <ul className="mt-3 space-y-2.5">
          {STAGES.map((s) => (
            <li key={s.id} className="flex gap-3 text-xs">
              <span className="text-base">{s.emoji}</span>
              <div>
                <b className="text-[13px]">
                  {s.label} · {s.fromMonth}개월~
                </b>
                <p className="text-muted">
                  {s.meals} · {s.texture} · 1회 {s.amount}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          출처: 식약처·대한소아과학회 공개 지침을 정리한 일반 기준이에요. 보고 있는 이유식 책과
          다르면 <code className="rounded bg-sand px-1">src/data/ingredients.ts</code> 와{" "}
          <code className="rounded bg-sand px-1">src/lib/stage.ts</code> 의 값을 책 기준으로
          고치고 <code className="rounded bg-sand px-1">source</code> 에 책 이름·쪽수를 적어두세요.
        </p>
      </Card>
    </Screen>
  );
}
