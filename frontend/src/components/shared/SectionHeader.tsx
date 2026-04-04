export function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-12">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
