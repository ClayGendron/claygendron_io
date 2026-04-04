import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { postsApi } from "@/admin/lib/api";
import type { BlogPost } from "@/admin/lib/types";

export default function PostsList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await postsApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    await postsApi.delete(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} post${posts.length !== 1 ? "s" : ""}`}
        actions={
          <Button onClick={() => navigate("/admin/posts/new")} size="sm">
            <Plus className="size-3.5" />
            New Post
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No posts yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate("/admin/posts/new")}
            >
              Write your first post
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
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/posts/${post.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                      {post.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                          {post.subtitle}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge published={post.published} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {formatDate(post.date)}
                      {post.reading_minutes > 0 && (
                        <span className="text-muted-foreground/60">
                          {" · "}
                          {post.reading_minutes} min read
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => navigate(`/admin/posts/${post.id}`)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          }
                          title="Delete post?"
                          description={`"${post.title}" will be permanently deleted.`}
                          onConfirm={() => handleDelete(post.id)}
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
