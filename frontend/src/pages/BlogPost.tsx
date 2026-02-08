import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { fetchPost, formatDate, type ParsedPost } from "@/lib/markdown";
import { MarkdownRenderer } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ParsedPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }

    setIsLoading(true);
    fetchPost(slug)
      .then((result) => {
        if (result) {
          setPost(result);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  if (isLoading) {
    return (
      <main className="min-h-[80vh] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 bg-muted" />
            <div className="h-10 w-3/4 bg-muted" />
            <div className="h-6 w-full bg-muted" />
            <div className="h-6 w-2/3 bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const { frontmatter, content, readingTime } = post;

  return (
    <main className="min-h-[80vh] px-6 py-16 md:px-12 md:py-24">
      <article className="mx-auto max-w-3xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All posts
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <time
            dateTime={frontmatter.date}
            className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground"
          >
            {formatDate(frontmatter.date)}
          </time>
          <h1 className="mt-4 font-serif text-3xl font-light tracking-[-0.02em] md:text-4xl lg:text-5xl">
            {frontmatter.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {frontmatter.excerpt}
          </p>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{readingTime}</span>
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <>
                <span className="text-muted-foreground/30">&middot;</span>
                <div className="flex gap-1.5">
                  {frontmatter.tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <MarkdownRenderer content={content} />
        </motion.div>

        {/* Footer navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-16 border-t border-border pt-10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to all posts
          </Link>
        </motion.div>
      </article>
    </main>
  );
}
