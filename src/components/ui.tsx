import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-blob border border-line bg-card p-4 shadow-[0_2px_10px_rgba(160,130,100,.06)] ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-extrabold">{children}</h2>
      {right ? <div className="text-xs font-semibold text-muted">{right}</div> : null}
    </div>
  );
}

export function Empty({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="rounded-blob border border-dashed border-line py-10 text-center">
      <div className="text-3xl">{emoji}</div>
      <p className="mt-2 text-sm text-muted">{children}</p>
    </div>
  );
}

/** 진행률 막대 — 도장깨기와 관찰 3일에 같이 쓴다 */
export function Bar({ value, tone = "mint" }: { value: number; tone?: "mint" | "butter" | "peach" }) {
  const bg = { mint: "bg-mint", butter: "bg-butter", peach: "bg-peach" }[tone];
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
      <div className={`h-full rounded-full ${bg} transition-[width] duration-500`} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}
