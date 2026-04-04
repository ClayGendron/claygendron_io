import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { TagInput } from "@/admin/components/TagInput";
import { LinksEditor } from "@/admin/components/LinksEditor";
import { projectsApi } from "@/admin/lib/api";
import type { ProjectCreate, ProjectUpdate } from "@/admin/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== "new";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [autoSlug, setAutoSlug] = useState(true);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    subtitle: "",
    content: "",
    date: "",
    pinned: false,
    published: false,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [impacts, setImpacts] = useState<string[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditing) return;
    projectsApi.get(Number(id)).then((p) => {
      setForm({
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle ?? "",
        content: p.content ?? "",
        date: p.date ? p.date.slice(0, 10) : "",
        pinned: p.pinned,
        published: p.published,
      });
      setTags(p.tags ?? []);
      setTools(p.tools ?? []);
      setImpacts(p.impacts ?? []);
      setLinks(p.links ?? {});
      setAutoSlug(false);
      setLoading(false);
    });
  }, [id, isEditing]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && autoSlug && !isEditing) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const base = {
        slug: form.slug,
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content || null,
        date: form.date ? new Date(form.date).toISOString() : null,
        pinned: form.pinned,
        published: form.published,
        order: 0,
        tags: tags.length ? tags : null,
        tools: tools.length ? tools : null,
        impacts: impacts.length ? impacts : null,
        links: Object.keys(links).length ? links : null,
      };

      if (isEditing) {
        await projectsApi.update(Number(id), base as ProjectUpdate);
      } else {
        await projectsApi.create(base as ProjectCreate);
      }
      navigate("/admin/projects");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <AdminPageHeader
        title={isEditing ? "Edit Project" : "New Project"}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/projects")}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>/projects/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="slug"
                      value={form.slug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        update("slug", e.target.value);
                      }}
                      required
                    />
                  </InputGroup>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={form.subtitle}
                    onChange={(e) => update("subtitle", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-end gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="flex items-center gap-6 pb-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => update("published", e.target.checked)}
                      className="accent-primary size-3.5"
                    />
                    <span className="text-muted-foreground">Published</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => update("pinned", e.target.checked)}
                      className="accent-primary size-3.5"
                    />
                    <span className="text-muted-foreground">Pinned</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Project write-up in Markdown format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <TagInput
                    value={tags}
                    onChange={setTags}
                    placeholder="Add a tag..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tools</Label>
                  <TagInput
                    value={tools}
                    onChange={setTools}
                    placeholder="Add a tool..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Impacts</Label>
                  <TagInput
                    value={impacts}
                    onChange={setImpacts}
                    placeholder="Add an impact..."
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Links</Label>
                <LinksEditor value={links} onChange={setLinks} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg">
              <Save className="size-3.5" />
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Project"
                  : "Create Project"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
