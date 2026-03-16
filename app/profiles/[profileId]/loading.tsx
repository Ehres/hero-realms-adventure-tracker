export default function ProfilePageLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header skeleton */}
        <header className="mb-8">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-8 w-48 animate-pulse rounded bg-muted" />
        </header>

        {/* Stats grid skeleton */}
        <section className="mb-10 grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-8 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </section>

        {/* Adventures header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded bg-muted" />
        </div>

        {/* Adventure card skeletons */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
