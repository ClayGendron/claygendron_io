export function KilnDivider() {
  return (
    <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 md:px-12">
      <div className="h-px flex-1 bg-border" />
      <div className="size-1.5 shrink-0 rounded-full bg-primary opacity-70" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
