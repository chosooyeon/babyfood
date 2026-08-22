import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이유식 수첩",
  description: "오늘 먹인 것과 새 재료 알레르기 관찰을 한 화면에서",
  appleWebApp: {
    capable: true,
    title: "이유식",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFE3D3",
  // 노치 아래까지 배경을 깔고, 안전영역은 각 화면이 padding 으로 피한다
  viewportFit: "cover",
  // 입력창을 탭했을 때 화면이 확대되는 iOS 동작을 막는다
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
