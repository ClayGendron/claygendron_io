export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-12 flex items-center gap-4">
      <div className="size-[5px] shrink-0 rounded-full bg-primary" />
      <div className="h-px w-6 bg-border" />
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
