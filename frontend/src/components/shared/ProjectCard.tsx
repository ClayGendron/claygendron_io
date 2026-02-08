import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { type Project } from "@/content/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn(
        "group relative flex flex-col p-6 rounded-lg border transition-all",
        "border-border/50 bg-card/30 hover:border-border hover:bg-card hover:shadow-sm",
        featured && "sm:col-span-2 md:col-span-1"
      )}
    >
      {/* Status indicator */}
      {project.status === "active" && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            Active
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {project.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {project.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Arrow indicator */}
      <ArrowUpRight className="absolute bottom-4 right-4 size-4 text-muted-foreground opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
    </Link>
  );
}
