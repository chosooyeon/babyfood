import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Screen title="설정">
      <Skeleton className="h-64 rounded-blob" />
      <Skeleton className="mt-4 h-56 rounded-blob" />
    </Screen>
  );
}
