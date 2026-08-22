import BottomNav from "./BottomNav";

/** 모든 화면의 공통 껍데기 — 폭 제한 + 하단 탭 자리 확보 */
export default function Screen({
  title,
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <main
        className="mx-auto w-full max-w-md px-4 pb-28"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}
      >
        {title ? <h1 className="mb-4 text-xl font-extrabold tracking-tight">{title}</h1> : null}
        {children}
      </main>
      <BottomNav />
    </>
  );
}
