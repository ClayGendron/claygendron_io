import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface ProjectData {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  pinned: boolean;
  tags: string[] | null;
  tools: string[] | null;
  impacts: string[] | null;
  links: Record<string, string> | null;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/content/projects/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFound) {
    return <Navigate to="/projects" replace />;
  }

  if (loading || !project) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center">
        <div className="size-6 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] px-(--page-gutter) py-16 md:py-24">
      <article className="mx-auto max-w-3xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Link
            to="/projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All projects
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="mb-6">
            <h1 className="font-serif text-4xl font-light tracking-[-0.02em] md:text-5xl">
              {project.title}
            </h1>
          </div>
          {project.subtitle && (
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {project.subtitle}
            </p>
          )}

          {/* Links */}
          {project.links && Object.keys(project.links).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <GitHubIcon className="size-4" />
                  View source
                </a>
              )}
              {project.links.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="size-4" />
                  Live demo
                </a>
              )}
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="tag">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </motion.header>

        {/* Content sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="space-y-10"
        >
          {/* Content / Overview */}
          {project.content && (
            <section>
              <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Overview
              </p>
              <MarkdownRenderer content={project.content} />
            </section>
          )}

          {/* Impacts / Highlights */}
          {project.impacts && project.impacts.length > 0 && (
            <section>
              <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Highlights
              </p>
              <ul className="space-y-2">
                {project.impacts.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tools / Tech Stack */}
          {project.tools && project.tools.length > 0 && (
            <section>
              <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tools.map((tech) => (
                  <span
                    key={tech}
                    className="border border-border bg-card/50 px-3 py-1.5 text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}
        </motion.div>

        {/* Footer navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-16 border-t border-border pt-10"
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to all projects
          </Link>
        </motion.div>
      </article>
    </main>
  );
}
