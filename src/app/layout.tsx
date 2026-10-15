import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * 검색·공유용 메타데이터의 기본값. 각 화면은 title·description·canonical 만 덮어쓴다.
 * 제목은 "화면 이름 · 이유식 수첩" 꼴이 되고(template), 홈은 SITE_TITLE 그대로.
 * 공유 미리보기 그림(public/og.png)은 npm run cards 가 /guide/og 를 찍어 만든다.
 */
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "이유식",
    "이유식 기록",
    "이유식 앱",
    "이유식 알레르기",
    "알레르기 3일 관찰",
    "이유식 재료 순서",
    "이유식 재료 시작 월령",
    "초기 이유식",
    "중기 이유식",
    "이유식 체험팩",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME} — 새 재료는 하나씩, 3일씩` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // 서치콘솔(구글)·서치어드바이저(네이버) 소유 확인 코드는 환경변수로 넣는다. 코드 수정 없이 붙일 수 있게.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
      : undefined,
  },
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

/** 검색엔진이 "무료 웹앱"으로 알아보게 하는 구조화 데이터 (schema.org) */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL.toString(),
  description: SITE_DESCRIPTION,
  inLanguage: "ko",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "iOS, Android, Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  featureList: [
    "아기 생년월일로 이유식 단계 자동 계산",
    "새 재료 3일 알레르기 관찰 자동 시작·해제",
    "재료별 시작 월령표와 다음 재료 추천",
    "이상반응 증상 기록과 타임라인",
    "시판 이유식 체험팩 오픈 시간표와 캘린더 알림",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        {children}
        <script
          type="application/ld+json"
          // JSON 안의 "<" 를 이스케이프해 스크립트 태그가 닫히는 사고를 막는다
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
