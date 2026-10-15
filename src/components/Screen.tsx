import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

/** 모든 화면의 공통 껍데기 — 폭 제한 + 하단 탭 자리 확보. back 을 주면 제목 왼쪽에 뒤로가기 (탭이 아닌 하위 화면) */
export default function Screen({
  title,
  back,
  children,
}: {
  title?: React.ReactNode;
  back?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main
        className="mx-auto w-full max-w-md px-4 pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        {title ? (
          <h1 className="mb-4 flex items-center gap-1 text-xl font-extrabold tracking-tight">
            {back ? (
              <Link href={back} aria-label="뒤로" className="-ml-2 rounded-full p-1 text-muted active:scale-95">
                <ChevronLeft size={22} />
              </Link>
            ) : null}
            {title}
          </h1>
        ) : null}
        {children}
      </main>
      <BottomNav />
    </>
  );
}
