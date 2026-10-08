"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SYMPTOM_META, type Symptom, type TrialStatus } from "@/lib/types";
import { setTrialStatus } from "@/app/actions";
import SubmitButton from "./SubmitButton";

/**
 * 이상반응 기록 모달.
 * 안전 확정(safe)은 버튼 한 번이라 폼만 쏘고, 이상반응은 증상을 받아야 하니 모달을 연다.
 */
export default function TrialSheet({
  ingredientId,
  ingredientName,
  emoji,
  current,
  defaultSymptoms = [],
  defaultNote = "",
  trigger,
}: {
  ingredientId: string;
  ingredientName: string;
  emoji: string;
  current: TrialStatus;
  defaultSymptoms?: Symptom[];
  defaultNote?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Symptom[]>(defaultSymptoms);

  // 서버 저장이 끝난 뒤에 닫는다 — 그동안 버튼에 스피너가 돈다
  async function submit(fd: FormData) {
    await setTrialStatus(fd);
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/30" onClick={() => setOpen(false)}>
          <div
            className="w-full rounded-t-blob bg-card p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <b className="text-base">
                {emoji} {ingredientName}
              </b>
              <button onClick={() => setOpen(false)} className="text-muted" aria-label="닫기">
                <X size={22} />
              </button>
            </div>

            <form action={submit}>
              <input type="hidden" name="ingredient_id" value={ingredientId} />
              <input type="hidden" name="status" value="allergic" />
              {picked.map((s) => (
                <input key={s} type="hidden" name="symptoms" value={s} />
              ))}

              <p className="text-xs font-semibold text-muted">어떤 반응이 있었나요?</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(SYMPTOM_META) as Symptom[]).map((s) => {
                  const on = picked.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
                      }
                      className={`flex items-center gap-1.5 rounded-2xl border px-3 py-3 text-[13px] font-semibold ${
                        on ? "border-berry bg-berry-soft" : "border-line bg-cream text-muted"
                      }`}
                    >
                      <span>{SYMPTOM_META[s].emoji}</span>
                      {SYMPTOM_META[s].label}
                    </button>
                  );
                })}
              </div>

              <textarea
                name="note"
                rows={2}
                defaultValue={defaultNote}
                placeholder="언제, 얼마나 (병원에서 물어봐요)"
                className="mt-3 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-peach"
              />

              <SubmitButton
                pendingLabel="저장 중…"
                className="mt-3 w-full rounded-2xl bg-berry py-3.5 font-bold text-white active:scale-[.98]"
              >
                이상반응으로 기록
              </SubmitButton>
            </form>

            {current === "allergic" ? (
              <form action={submit}>
                <input type="hidden" name="ingredient_id" value={ingredientId} />
                <input type="hidden" name="status" value="safe" />
                <SubmitButton
                  pendingLabel="저장 중…"
                  className="mt-2 w-full rounded-2xl border border-line py-3 text-sm font-bold text-muted"
                >
                  괜찮았어요 (기록 취소)
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
