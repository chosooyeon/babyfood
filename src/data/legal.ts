/**
 * 개인정보처리방침·이용약관에 들어가는 값. 글은 /privacy, /terms 화면에 있고 여기엔 바뀔 수 있는 값만 둔다.
 *
 * ⚠️ 배포 전에 운영자 이름과 연락처를 채워야 한다. 개인정보보호법은 처리방침에
 *    개인정보 보호책임자(이름·연락처)를 적도록 하고 있다 (제30조, 제31조).
 */
export const LEGAL = {
  /** 개인정보 보호책임자 겸 운영자. 개인이면 이름, 사업자면 상호. */
  operator: "이유식 수첩 운영자",
  /** 문의·삭제 요청을 받는 이메일. 비어 있으면 화면에 '앱 안 제보함' 만 안내한다. */
  contact: "1whtndus@naver.com",
  /** Supabase 프로젝트 리전 — 대시보드 Project Settings → General → Region 의 값 */
  dbRegion: "Northeast Asia (Seoul)",
  /** 처리방침 시행일. 내용을 고치면 날짜도 올리고 CHANGELOG 에 남긴다. */
  privacyEffective: "2026-10-15",
  termsEffective: "2026-10-14",
} as const;
