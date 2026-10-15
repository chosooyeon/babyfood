"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { deleteHouseholdData } from "../actions";

/**
 * "이 수첩 기록 모두 지우기". 한 번 눌러서는 안 지워진다 — 확인 문장을 보여주고
 * 체크박스를 켜야 버튼이 살아난다. 아기 안고 한 손으로 쓰다 스치는 사고를 막기 위해.
 */
export default function DeleteHousehold() {
  const [open, setOpen] = useState(false);
  const [sure, setSure] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-berry"
      >
        <Trash2 size={13} /> 이 수첩 기록 모두 지우기
      </button>
    );
  }

  return (
    <form action={deleteHouseholdData} className="mt-3 rounded-2xl border border-berry/30 bg-berry-soft/50 p-4">
      <p className="text-xs leading-relaxed text-ink/80">
        아기 정보, 끼니·분유·재료·이상반응 기록, 체험팩 체크, 제보가 <b className="text-ink">모두</b> 지워지고 새 수첩
        코드가 발급돼요. 같은 코드를 쓰는 가족 폰에서도 사라져요. 되돌릴 수 없어요.
      </p>
      <label className="mt-3 flex items-start gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          name="confirm"
          value="yes"
          checked={sure}
          onChange={(e) => setSure(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-berry"
        />
        이해했어요. 모두 지울게요.
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setSure(false);
          }}
          className="flex-1 rounded-xl bg-card py-2.5 text-xs font-bold text-muted"
        >
          취소
        </button>
        <SubmitButton
          pendingLabel="지우는 중…"
          className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white ${sure ? "bg-berry" : "pointer-events-none bg-berry/40"}`}
        >
          모두 지우기
        </SubmitButton>
      </div>
    </form>
  );
}
