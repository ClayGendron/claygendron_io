import { useShiki } from "@/hooks/useShiki";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const { highlight, isLoading } = useShiki();
  const { resolvedTheme } = useTheme();

  // Extract language from className (e.g., "language-typescript")
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";

  // Inline code
  if (inline) {
    return (
      <code
        className={cn(
          "px-1.5 py-0.5 rounded-md text-[0.9em]",
          "bg-muted text-foreground font-mono",
          "before:content-none after:content-none"
        )}
      >
        {children}
      </code>
    );
  }

  // Code block
  if (isLoading) {
    return (
      <div className="relative my-6">
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4">
          <code className="font-mono text-sm">{children}</code>
        </pre>
      </div>
    );
  }

  const html = highlight(children.trim(), lang, resolvedTheme);

  return (
    <div className="relative my-6 group">
      {/* Language badge */}
      {lang && (
        <div className="absolute top-0 right-0 px-2 py-1 text-xs text-muted-foreground bg-muted/80 rounded-bl-md rounded-tr-lg border-l border-b border-border/50">
          {lang}
        </div>
      )}
      <div
        className={cn(
          "overflow-x-auto rounded-lg border border-border",
          "[&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:m-0",
          "[&_code]:text-sm [&_code]:leading-relaxed"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
