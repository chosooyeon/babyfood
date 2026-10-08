"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * form 안에서 쓰는 제출 버튼. 서버 액션이 끝날 때까지 스피너를 보여주고 눌리지 않는다.
 * 폰에서 서버 왕복이 1초를 넘으면 "눌린 건가?" 하고 두 번 누르게 되는데, 그걸 막는다.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-1.5 disabled:opacity-70 ${className}`}
    >
      {pending ? <Loader2 size={15} className="shrink-0 animate-spin" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
