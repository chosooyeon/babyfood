import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <Screen title="기록">
      <Skeleton className="mt-7 mb-3 h-4 w-28" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-5">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-20 rounded-blob" />
          <Skeleton className="mt-2 h-20 rounded-blob" />
        </div>
      ))}
    </Screen>
  );
}
