"use client";

import { useActionState } from "react";
import { sendTip } from "@/app/samples/actions";
import SubmitButton from "@/components/SubmitButton";
import { TOPICS, type Topic } from "@/data/tips";

const field =
  "mt-1 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-peach";

/**
 * 문의·제보 폼 하나로 전부 받는다 (체험팩 시간표, 재료 기준, 버그, 건의).
 * 보내면 폼이 사라지고 고맙다는 말만 남는다. /settings/contact 에서 쓴다.
 */
export default function TipForm({ defaultTopic }: { defaultTopic?: Topic }) {
  const [result, action] = useActionState(sendTip, null);
  if (result?.ok) {
    return (
      <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-3 text-sm font-bold text-ink">
        고마워요! 확인하고 반영할게요 🙏
      </p>
    );
  }
  return (
    <form action={action} className="mt-3 space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-muted">주제</span>
        <select name="brand" defaultValue={defaultTopic ?? TOPICS[0]} className={field}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">내용</span>
        <textarea
          name="detail"
          maxLength={500}
          rows={4}
          placeholder="예: 베베쿡이 10월부터 오전 10시로 바뀌었어요 / 달걀노른자 시작 월령이 책과 달라요 (책 이름·쪽수)"
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
        보내기
      </SubmitButton>
    </form>
  );
}
