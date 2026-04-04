import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { projectsApi } from "@/admin/lib/api";
import type { Project } from "@/admin/lib/types";

export default function ProjectsList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setProjects(await projectsApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={() => navigate("/admin/projects/new")} size="sm">
            <Plus className="size-3.5" />
            New Project
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No projects yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate("/admin/projects/new")}
            >
              Create your first project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Tags
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {project.title}
                      </Link>
                      {project.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                          {project.subtitle}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge published={project.published} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {project.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="tag">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}`)
                          }
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          }
                          title="Delete project?"
                          description={`"${project.title}" will be permanently deleted.`}
                          onConfirm={() => handleDelete(project.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
