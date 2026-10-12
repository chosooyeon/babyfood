import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Screen title="체험팩 신청">
      <Skeleton className="-mt-2 mb-4 h-8" />
      <Skeleton className="h-36 rounded-blob" />
      <Skeleton className="mt-7 mb-3 h-4 w-24" />
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="mb-2 h-24 rounded-blob" />
      ))}
    </Screen>
  );
}
