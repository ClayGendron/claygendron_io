import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fetchPostIndex, formatDate, type PostMeta } from "@/lib/markdown";
import { SectionHeader } from "@/components/shared";

export default function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPostIndex()
      .then(setPosts)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-[80vh] px-(--page-gutter) py-16 md:py-24">
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <SectionHeader label="Writing" />
          <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            Blog
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Thoughts on AI, data engineering, and building things that matter.
          </p>
        </motion.div>

        {/* Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse border-t border-border pt-8"
                >
                  <div className="mb-3 h-3 w-24 bg-muted" />
                  <div className="mb-3 h-6 w-3/4 bg-muted" />
                  <div className="h-4 w-full bg-muted" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.15 + index * 0.05,
                  }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block border-t border-border pt-8 text-inherit no-underline transition-[border-color] hover:border-primary"
                  >
                    <p className="mb-3 font-mono text-[0.65rem] tracking-[0.05em] text-muted-foreground">
                      {formatDate(post.date)} &middot; {post.readingTime}
                    </p>
                    <h3 className="mb-3 font-serif text-xl font-normal leading-[1.35] transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="text-[0.85rem] leading-relaxed text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.78rem] text-muted-foreground transition-colors group-hover:text-primary">
                      Read <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-serif text-lg text-muted-foreground">
                No posts yet. Check back soon.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
