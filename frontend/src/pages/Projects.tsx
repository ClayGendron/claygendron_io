import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader, KilnDivider } from "@/components/shared";
import { Badge } from "@/components/ui/badge";

interface ProjectItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  pinned: boolean;
  tags: string[] | null;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    fetch("/api/content/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {});
  }, []);

  const featured = projects.filter((p) => p.pinned);
  const other = projects.filter((p) => !p.pinned);

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
          <SectionHeader label="Work" />
          <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-[-0.02em] md:text-5xl lg:text-6xl">
            Projects
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A collection of things I've built — from production systems serving
            thousands of users to experimental side projects.
          </p>
        </motion.div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="mb-16"
          >
            <div>
              {featured.map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.15 + index * 0.1,
                  }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className="group grid grid-cols-[2rem_1fr] items-baseline gap-4 border-b border-border py-7 text-inherit no-underline transition-[border-color] first:border-t md:grid-cols-[3rem_1fr_2fr_auto] md:gap-8 hover:border-primary/10"
                  >
                    <span className="font-mono text-[0.7rem] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-serif text-xl font-normal tracking-[-0.01em] transition-colors group-hover:text-primary md:text-[1.6rem]">
                        {project.title}
                      </div>
                      <div className="mt-1.5 flex gap-2">
                        {project.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="tag">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="hidden text-[0.88rem] leading-relaxed text-muted-foreground md:block">
                      {project.subtitle}
                    </span>
                    <span className="hidden text-lg text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary md:block">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Divider */}
        {other.length > 0 && (
          <div className="my-12">
            <KilnDivider />
          </div>
        )}

        {/* Other Projects */}
        {other.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
          >
            <SectionHeader label="More Projects" />
            <div>
              {other.map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.4 + index * 0.05,
                  }}
                >
                  <Link
                    to={`/projects/${project.slug}`}
                    className="group grid grid-cols-[2rem_1fr] items-baseline gap-4 border-b border-border py-5 text-inherit no-underline transition-[border-color] first:border-t md:grid-cols-[3rem_1fr_2fr_auto] md:gap-8 hover:border-primary/10"
                  >
                    <span className="font-mono text-[0.7rem] text-muted-foreground">
                      {String(featured.length + index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-serif text-lg font-normal transition-colors group-hover:text-primary">
                        {project.title}
                      </div>
                      <div className="mt-1 flex gap-2">
                        {project.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="tag">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="hidden text-sm text-muted-foreground md:block">
                      {project.subtitle}
                    </span>
                    <span className="hidden text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary md:block">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
