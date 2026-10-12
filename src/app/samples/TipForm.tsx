"use client";

import { useActionState } from "react";
import { sendTip } from "./actions";
import SubmitButton from "@/components/SubmitButton";

const field =
  "mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-peach";

/** 시간표가 틀렸거나 빠진 브랜드가 있을 때 보내는 제보 폼. 보내면 폼이 사라지고 고맙다는 말만 남는다. */
export default function TipForm() {
  const [result, action] = useActionState(sendTip, null);
  if (result?.ok) {
    return (
      <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-3 text-sm font-bold text-ink">
        고마워요! 확인하고 시간표에 반영할게요 🙏
      </p>
    );
  }
  return (
    <form action={action} className="mt-3 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-muted">브랜드</span>
        <input name="brand" maxLength={60} placeholder="예: 베베쿡" className={field} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">내용</span>
        <textarea
          name="detail"
          maxLength={500}
          rows={3}
          placeholder="예: 10월부터 오전 10시로 바뀌었어요 / 이 브랜드도 체험팩 있어요"
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">링크 (선택)</span>
        <input name="url" inputMode="url" maxLength={300} placeholder="https://" className={field} />
      </label>
      {result && !result.ok ? <p className="text-xs font-semibold text-berry">{result.error}</p> : null}
      <SubmitButton
        pendingLabel="보내는 중…"
        className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white active:scale-[.98]"
      >
        제보 보내기
      </SubmitButton>
    </form>
  );
}
