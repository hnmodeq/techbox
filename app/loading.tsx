export default function Loading() {
  return (
    <main
      className="flex min-h-[60vh] w-full items-center justify-center px-4 py-8"
      dir="rtl"
      aria-label="در حال بارگذاری صفحه"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--border-color)] border-t-[var(--home)]"
        role="status"
        aria-label="در حال بارگذاری"
      />
    </main>
  );
}
