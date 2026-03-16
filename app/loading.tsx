import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header skeleton */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="mt-1.5 h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-36" />
        </header>

        {/* Profile card grid skeleton — 3 cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <Skeleton className="mb-3 h-5 w-32" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
