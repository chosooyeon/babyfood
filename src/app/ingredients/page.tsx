import Screen from "@/components/Screen";
import IngredientGrid from "@/components/IngredientGrid";
import { getBaby, getTrials } from "@/lib/queries";
import { monthsOld, today } from "@/lib/stage";
import { buildStates } from "@/lib/derive";

export const dynamic = "force-dynamic";

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const [baby, trials, { open }] = await Promise.all([getBaby(), getTrials(), searchParams]);
  const months = baby ? monthsOld(baby.birth_date, today()) : 0;
  const states = buildStates(trials, months, today());

  return (
    <Screen title="재료 도장깨기">
      <IngredientGrid states={states} months={months} initialOpen={open} />
    </Screen>
  );
}
