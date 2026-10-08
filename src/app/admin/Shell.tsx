import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** /admin 아래 화면들의 공통 틀. 왼쪽 "앱으로", 가운데 탭(현황·기획서), 오른쪽은 화면별 버튼 */
export default function Shell({
  children,
  right,
  tab,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  tab?: "status" | "spec";
}) {
  return (
    <main
      className="mx-auto w-full max-w-md px-4 pb-12"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
          <ArrowLeft size={14} /> 앱으로
        </Link>
        {tab ? (
          <nav className="flex rounded-full bg-sand p-0.5 text-xs font-bold">
            <TabLink href="/admin" on={tab === "status"}>
              현황
            </TabLink>
            <TabLink href="/admin/spec" on={tab === "spec"}>
              기획서
            </TabLink>
          </nav>
        ) : (
          <h1 className="text-base font-extrabold">관리</h1>
        )}
        <div className="min-w-12 text-right">{right}</div>
      </div>
      {children}
    </main>
  );
}

function TabLink({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 ${on ? "bg-card text-ink shadow-sm" : "text-muted"}`}
    >
      {children}
    </Link>
  );
}
