export default function Loading() {
  return (
    <main className="min-h-[70vh] w-full px-4 py-8 sm:px-6 lg:px-8" dir="rtl" aria-label="در حال بارگذاری صفحه">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
          <div className="h-10 w-full max-w-md animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="min-h-44 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-size)]"
            >
              <div className="mb-4 aspect-[16/9] animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
                <div className="h-4 w-1/2 animate-pulse rounded-[var(--corner-radius)] bg-[var(--muted-background)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
