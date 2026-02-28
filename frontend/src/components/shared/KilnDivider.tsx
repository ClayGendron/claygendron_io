export function KilnDivider() {
  return (
    <div className="flex items-center gap-4 px-(--page-gutter)">
      <div className="h-px flex-1 bg-border" />
      <div className="size-1.5 shrink-0 rounded-full bg-primary opacity-70" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
