"use client";

import { useActionState } from "react";
import { useHouseholdCode } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default function HouseholdForm() {
  const [error, action] = useActionState(useHouseholdCode, null);
  return (
    <form action={action} className="mt-3 flex flex-wrap gap-2">
      <input
        name="code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="ABCD-EFGH-JKMN"
        className="min-w-0 flex-1 rounded-2xl border border-line bg-cream px-4 py-3 font-mono text-sm tracking-wider uppercase outline-none focus:border-peach"
      />
      <SubmitButton
        pendingLabel="확인 중…"
        className="shrink-0 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white active:scale-[.98]"
      >
        이어 쓰기
      </SubmitButton>
      {error ? <p className="basis-full text-xs font-semibold text-berry">{error}</p> : null}
    </form>
  );
}
