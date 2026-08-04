export default function HomeV2Loading() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 dark:bg-black sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto w-full max-w-[1280px] animate-pulse">
        <div className="h-3 w-40 bg-muted" />
        <div className="mt-4 h-12 max-w-2xl bg-muted" />
        <div className="mt-3 h-5 max-w-xl bg-muted" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="h-[470px] bg-muted" />
          <div className="h-[470px] bg-muted" />
        </div>
      </div>
    </main>
  );
}
