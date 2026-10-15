import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/data/legal";

/** 개인정보처리방침·이용약관이 같이 쓰는 글 틀. 조항은 h2, 본문은 작은 글씨, 표는 넘치면 가로 스크롤. */

export function Article({ children }: { children: ReactNode }) {
  return <article className="space-y-7 text-[13px] leading-relaxed text-ink/85 [word-break:keep-all]">{children}</article>;
}

export function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[15px] font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[520px] text-xs">
        <thead>
          <tr className="text-left text-[11px] text-muted">
            {head.map((h) => (
              <th key={h} className="pb-2 pr-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line align-top">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 운영자 연락처. 이메일이 비어 있으면 앱 안 제보함만 안내한다. */
export function Contact() {
  return (
    <p>
      {LEGAL.operator}
      {LEGAL.contact ? (
        <>
          {" · "}
          <a href={`mailto:${LEGAL.contact}`} className="font-semibold text-peach underline">
            {LEGAL.contact}
          </a>
        </>
      ) : null}
      {" · 앱 안 "}
      <Link href="/settings/contact" className="font-semibold text-peach underline">
        문의·제보
      </Link>
      으로도 보낼 수 있어요.
    </p>
  );
}

/** 두 문서 아래에 서로 오가는 링크 */
export function LegalFooter({ here }: { here: "privacy" | "terms" }) {
  return (
    <p className="mt-10 text-center text-[11px] text-muted">
      {here === "privacy" ? (
        <Link href="/terms" className="underline">
          이용약관 보기
        </Link>
      ) : (
        <Link href="/privacy" className="underline">
          개인정보처리방침 보기
        </Link>
      )}
      {" · "}
      <Link href="/" className="underline">
        홈으로
      </Link>
    </p>
  );
}
