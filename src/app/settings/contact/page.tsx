import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Screen from "@/components/Screen";
import { Card } from "@/components/ui";
import TipForm from "@/components/TipForm";
import { TOPICS, type Topic } from "@/data/tips";
import { SAMPLES_INFO_CHECKED, SAMPLES_SOURCE, TIPS_PER_DAY } from "@/data/samples";
import { LEGAL } from "@/data/legal";
import { track } from "@/lib/track";

export const metadata: Metadata = {
  title: "문의·제보",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

/**
 * 문의·제보 한 곳. 체험팩 시간표, 재료·단계 기준, 오류, 건의를 전부 같은 폼으로 받는다 (tips 테이블).
 * 설정 탭의 '문의·제보' 버튼과 체험팩 화면 아래 링크, 개인정보처리방침에서 들어온다.
 *   ?topic=체험팩 시간표  처럼 주제를 미리 고를 수 있다
 */
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  await track("/settings/contact");
  const { topic } = await searchParams;
  const defaultTopic = (TOPICS as readonly string[]).includes(topic ?? "") ? (topic as Topic) : undefined;

  return (
    <Screen title="문의·제보">
      <Link href="/settings" className="-mt-2 mb-4 inline-flex items-center gap-0.5 text-xs font-bold text-muted">
        <ChevronLeft size={14} /> 설정
      </Link>
      <Card>
        <p className="text-xs leading-relaxed text-muted [word-break:keep-all]">
          체험팩 오픈 시각이 바뀌었거나, 재료 시작 월령이 보고 계신 책과 다르거나, 앱이 이상하게 굴면 여기로 보내주세요.
          확인하고 반영할게요. 하루 {TIPS_PER_DAY}건까지 보낼 수 있어요.
        </p>
        <TipForm defaultTopic={defaultTopic} />
      </Card>
      <p className="mt-4 text-[11px] leading-relaxed text-muted [word-break:keep-all]">
        지금 체험팩 시간표는 <b className="text-ink">{SAMPLES_SOURCE}</b>, 월령·구성·비용은{" "}
        <b className="text-ink">{SAMPLES_INFO_CHECKED}</b> 공식 홈 기준이에요. 재료·단계 기준은 식약처·대한소아과학회 공개 지침을
        정리한 것이고요.
        {LEGAL.contact ? (
          <>
            {" "}
            이메일은{" "}
            <a href={`mailto:${LEGAL.contact}`} className="underline">
              {LEGAL.contact}
            </a>
            .
          </>
        ) : null}
      </p>
    </Screen>
  );
}
