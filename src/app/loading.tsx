import Screen from "@/components/Screen";
import { Skeleton } from "@/components/ui";

/** 오늘 화면의 뼈대. 탭을 누르면 서버 응답 전에 이게 먼저 뜬다. */
export default function Loading() {
  return (
    <Screen>
      <div className="rounded-blob bg-peach-soft/60 p-5">
        <Skeleton className="h-3 w-28 bg-card/70" />
        <Skeleton className="mt-3 h-7 w-44 bg-card/70" />
        <Skeleton className="mt-3 h-4 w-36 bg-card/70" />
        <div className="mt-4 flex gap-1.5">
          <Skeleton className="h-7 w-20 rounded-full bg-card/70" />
          <Skeleton className="h-7 w-16 rounded-full bg-card/70" />
          <Skeleton className="h-7 w-24 rounded-full bg-card/70" />
        </div>
      </div>
      <Skeleton className="mt-7 mb-3 h-4 w-24" />
      <Skeleton className="h-24 rounded-blob" />
      <Skeleton className="mt-4 h-14 rounded-blob bg-peach-soft/60" />
      <Skeleton className="mt-7 mb-3 h-4 w-32" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </Screen>
  );
}
