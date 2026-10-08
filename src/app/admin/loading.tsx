import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-12" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)" }}>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="mt-5 h-24 rounded-blob" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-blob" />
        ))}
      </div>
      <Skeleton className="mt-4 h-48 rounded-blob" />
      <Skeleton className="mt-4 h-40 rounded-blob" />
    </main>
  );
}
