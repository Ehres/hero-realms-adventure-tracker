export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header skeleton */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="h-7 w-52 animate-pulse rounded bg-muted" />
            <div className="mt-1.5 h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        </header>

        {/* Profile card grid skeleton — 3 cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
