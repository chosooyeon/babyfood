import Link from "next/link";
import { Gift } from "lucide-react";

/**
 * 홈 오른쪽 위의 체험팩 버튼. 아기 등록 전·후 둘 다 보인다 —
 * 체험팩은 아기 정보와 상관없이 누구나 신청하는 것이고, 시간을 놓치기 쉬워 눈에 띄어야 한다.
 */
export default function SamplesLink() {
  return (
    <Link
      href="/samples"
      aria-label="시판 이유식 체험팩 신청"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-peach/40 bg-card px-3 py-1.5 text-[11px] font-bold text-ink shadow-sm active:scale-[.97]"
    >
      <Gift size={14} className="text-peach" /> 체험팩
    </Link>
  );
}
