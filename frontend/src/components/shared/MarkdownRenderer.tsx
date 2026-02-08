import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        // Headings
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
        "prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3",
        // Paragraphs
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Lists
        "prose-li:text-muted-foreground prose-li:marker:text-muted-foreground/50",
        // Blockquotes
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:not-italic",
        // Strong/Bold
        "prose-strong:text-foreground prose-strong:font-semibold",
        // Images
        "prose-img:rounded-lg prose-img:border prose-img:border-border",
        // Horizontal rules
        "prose-hr:border-border",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: ({ className: codeClassName, children }) => {
            const isInline = !codeClassName;
            return (
              <CodeBlock className={codeClassName} inline={isInline}>
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            );
          },
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
