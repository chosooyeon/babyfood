"use client";

import { useActionState, useState } from "react";
import { addBottle } from "@/app/actions";
import { useNowHHMM } from "@/lib/use-now";
import SubmitButton from "./SubmitButton";

const QUICK = [60, 90, 120, 150, 180, 210];

/** 숫자만 받아 "HH:MM" 꼴로 — 기기마다 제각각인 기본 time 입력창 대신 쓴다 (숫자 키패드가 뜬다) */
function formatTime(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}

/**
 * 분유 빠른 기록. 시각은 지금 시각이 채워져 있고 손대지 않으면 30초마다 따라간다.
 * 고치려면 숫자만 치면 된다 (1530 → 15:30). 저장하면 다시 지금으로.
 */
export default function BottleForm({ date }: { date: string }) {
  const live = useNowHHMM() ?? "";
  const [edited, setEdited] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const time = edited ?? live;
  const [error, action] = useActionState(
    async (_prev: string | null, fd: FormData) => {
      const err = await addBottle(fd);
      if (!err) {
        setAmount("");
        setEdited(null);
      }
      return err;
    },
    null,
  );

  return (
    <form action={action} className="mt-3 rounded-2xl bg-sky-soft/70 p-3">
      <input type="hidden" name="date" value={date} />
      <div className="flex items-center gap-2">
        <label className="relative">
          <input
            name="fed_at"
            inputMode="numeric"
            autoComplete="off"
            value={time}
            onChange={(e) => setEdited(formatTime(e.target.value))}
            onFocus={(e) => e.target.select()}
            placeholder="15:30"
            aria-label="먹인 시각"
            className={`w-[84px] rounded-xl border bg-card px-2 py-2 text-center text-base font-extrabold tabular-nums outline-none focus:border-sky ${
              edited !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? "border-berry" : "border-line"
            }`}
          />
          {edited !== null ? (
            <button
              type="button"
              onClick={() => setEdited(null)}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-sky"
            >
              지금으로
            </button>
          ) : null}
        </label>
        <input
          name="amount_ml"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="ml"
          className="w-16 min-w-0 rounded-xl border border-line bg-card px-2 py-2 text-center text-base outline-none focus:border-sky"
        />
        <SubmitButton pendingLabel="저장" className="ml-auto shrink-0 rounded-xl bg-sky px-3.5 py-2.5 text-xs font-extrabold text-white active:scale-[.98]">
          🍼 추가
        </SubmitButton>
      </div>
      {error ? <p className="mt-2 text-[11px] font-semibold text-berry">{error}</p> : null}
      <div className={`flex flex-wrap gap-1.5 ${edited !== null ? "mt-5" : "mt-2"}`}>
        {QUICK.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(String(a))}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              amount === String(a) ? "border-sky bg-card text-ink" : "border-transparent bg-card/70 text-muted"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </form>
  );
}
