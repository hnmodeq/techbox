export function Spinner({
  className = "h-8 w-8",
  label = "در حال بارگذاری",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`${className} animate-spin rounded-full border-[3px] border-[var(--border-color)] border-t-[var(--home)]`}
      role="status"
      aria-label={label}
    />
  );
}

export function SpinnerCenter({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className="flex w-full items-center justify-center py-16" dir="rtl">
      <Spinner className={className} label={label} />
    </div>
  );
}
