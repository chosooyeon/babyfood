/** 문의·제보 주제 — tips.brand 열에 그대로 저장돼 /admin/tips 에서 보인다. 서버·클라이언트 양쪽에서 쓴다 */
export const TOPICS = ["체험팩 시간표", "재료·단계 기준", "오류·불편", "건의·기타"] as const;
export type Topic = (typeof TOPICS)[number];
