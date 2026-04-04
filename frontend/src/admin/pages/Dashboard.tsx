import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  FileText,
  User,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { projectsApi, postsApi, aboutApi } from "@/admin/lib/api";

interface ContentCounts {
  projects: number;
  posts: number;
  hasAbout: boolean;
}

export default function Dashboard() {
  const [counts, setCounts] = useState<ContentCounts | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projects, posts, about] = await Promise.all([
          projectsApi.list(),
          postsApi.list(),
          aboutApi.get().catch(() => null),
        ]);
        setCounts({
          projects: projects.length,
          posts: posts.length,
          hasAbout: about !== null,
        });
      } catch {
        // Counts are non-critical
      }
    }
    load();
  }, []);

  const cards = [
    {
      to: "/admin/projects",
      label: "Projects",
      icon: FolderKanban,
      count: counts?.projects,
    },
    {
      to: "/admin/posts",
      label: "Posts",
      icon: FileText,
      count: counts?.posts,
    },
    {
      to: "/admin/about",
      label: "About",
      icon: User,
      count: counts?.hasAbout ? "Configured" : "Not set",
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      count: null,
    },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Manage your site content" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className="hover:ring-primary/30 transition-all cursor-pointer">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center size-9 bg-primary/10">
                    <card.icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{card.label}</p>
                    {card.count !== null && card.count !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {typeof card.count === "number"
                          ? `${card.count} items`
                          : card.count}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
