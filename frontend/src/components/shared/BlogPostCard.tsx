import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { type BlogPost, formatDate } from "@/content/posts";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block py-6 border-b border-border/50 last:border-0 transition-colors hover:border-border"
    >
      <article className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Date */}
        <time
          dateTime={post.date}
          className="text-sm text-muted-foreground shrink-0 sm:w-28"
        >
          {formatDate(post.date)}
        </time>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground">
              {post.readingTime}
            </span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <div className="flex gap-1.5">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 translate-x-0 translate-y-0 transition-all group-hover:opacity-100 shrink-0 mt-1" />
      </article>
    </Link>
  );
}
