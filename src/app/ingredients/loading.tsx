import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Screen title="재료 도장깨기">
      <Skeleton className="h-24 rounded-blob" />
      <div className="mt-4 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 16 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </Screen>
  );
}
