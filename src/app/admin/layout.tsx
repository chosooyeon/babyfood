import type { Metadata } from "next";

/** 관리 화면은 검색에 나오면 안 된다. robots.txt 로도 막지만 링크를 타고 온 봇을 위해 한 번 더. */
export const metadata: Metadata = {
  title: "관리",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
