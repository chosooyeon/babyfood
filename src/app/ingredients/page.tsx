import type { Metadata } from "next";
import Screen from "@/components/Screen";
import { INGREDIENTS } from "@/data/ingredients";
import IngredientGrid from "@/components/IngredientGrid";
import { getBaby, getTrials } from "@/lib/queries";
import { monthsOld, today } from "@/lib/stage";
import { buildStates } from "@/lib/derive";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

/** 재료 사전은 공개 정보라 검색에 나오게 둔다. 아기 등록 전엔 전부 '안 먹어봄' 으로 보여 크롤러도 목록을 읽는다 */
export const metadata: Metadata = {
  title: `이유식 재료 ${INGREDIENTS.length}가지 시작 월령표`,
  description: `쌀·소고기·브로콜리부터 달걀·생선까지 이유식 재료 ${INGREDIENTS.length}가지의 시작 가능 월령, 알레르기 위험도, 조리 팁. 돌 전 금지 재료는 이유와 함께 표시. 아기 생년월일을 넣으면 지금 먹여도 되는 재료만 골라 줍니다.`,
  alternates: { canonical: "/ingredients" },
};

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  await track("/ingredients");
  const [baby, trials, { open }] = await Promise.all([getBaby(), getTrials(), searchParams]);
  const months = baby ? monthsOld(baby.birth_date, today()) : 0;
  const states = buildStates(trials, months, today());

  return (
    <Screen title="재료 도장깨기" back="/">
      <IngredientGrid states={states} months={months} initialOpen={open} />
    </Screen>
  );
}
