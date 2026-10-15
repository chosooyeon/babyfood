import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Screen title="먹인 것">
      <Skeleton className="h-[420px] rounded-blob" />
      <Skeleton className="mt-7 h-20 rounded-blob" />
      <Skeleton className="mt-2 h-20 rounded-blob" />
    </Screen>
  );
}
