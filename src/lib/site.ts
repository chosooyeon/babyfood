/**
 * 사이트 주소·이름·설명 — 메타데이터(검색·공유 미리보기), robots, sitemap 이 모두 여기서 읽는다.
 *
 * 주소는 Vercel 이 넣어 주는 프로덕션 도메인을 우선 쓰고, 없으면(로컬·프리뷰) 아래 기본값.
 * 도메인을 사면 NEXT_PUBLIC_SITE_URL 환경변수 하나만 바꾸면 된다.
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const SITE_URL = new URL(fromEnv ?? "https://babyfood-sable.vercel.app");
/** 소개 카드·OG 이미지에 찍는 짧은 주소 (https:// 없이) */
export const SITE_HOST = SITE_URL.host;

export const SITE_NAME = "이유식 수첩";
/** 검색 결과 제목. 브랜드명 + 사람들이 실제로 치는 말 */
export const SITE_TITLE = "이유식 수첩 — 이유식 알레르기 관찰·재료 기록 앱";
export const SITE_DESCRIPTION =
  "새 재료는 하나씩, 3일씩. 아기 생년월일 하나로 이유식 단계·재료 시작 월령·3일 알레르기 관찰이 자동으로 계산되는 무료 이유식 기록 앱. 로그인 없이 바로 쓰고, 시판 이유식 체험팩 오픈 시간표까지.";
