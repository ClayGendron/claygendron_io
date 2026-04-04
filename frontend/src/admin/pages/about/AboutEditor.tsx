import { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { aboutApi } from "@/admin/lib/api";
import type { About, AboutWorkArea } from "@/admin/lib/types";

export default function AboutEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState<About | null>(null);

  const [form, setForm] = useState({
    title: "",
    introduction: "",
    focus: "",
    interests: "",
    languages: "",
    location: "",
    current_title: "",
    current_employer: "",
  });

  const [workAreas, setWorkAreas] = useState<AboutWorkArea[]>([]);
  const [newArea, setNewArea] = useState({ title: "", description: "" });

  useEffect(() => {
    aboutApi
      .get()
      .then((data) => {
        setAbout(data);
        setForm({
          title: data.title ?? "",
          introduction: data.introduction ?? "",
          focus: data.focus ?? "",
          interests: data.interests ?? "",
          languages: data.languages ?? "",
          location: data.location ?? "",
          current_title: data.current_title ?? "",
          current_employer: data.current_employer ?? "",
        });
        setWorkAreas(data.work_areas);
      })
      .catch(() => {
        // No about entry yet — start fresh
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title: form.title || null,
        introduction: form.introduction || null,
        focus: form.focus || null,
        interests: form.interests || null,
        languages: form.languages || null,
        location: form.location || null,
        current_title: form.current_title || null,
        current_employer: form.current_employer || null,
      };
      const updated = await aboutApi.update(data);
      setAbout(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addWorkArea = async () => {
    if (!newArea.title.trim()) return;
    try {
      const area = await aboutApi.createWorkArea({
        title: newArea.title,
        description: newArea.description || null,
        order: workAreas.length,
      });
      setWorkAreas((prev) => [...prev, area]);
      setNewArea({ title: "", description: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add work area");
    }
  };

  const deleteWorkArea = async (id: number) => {
    await aboutApi.deleteWorkArea(id);
    setWorkAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const moveWorkArea = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= workAreas.length) return;

    const updated = [...workAreas];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    const reordered = updated.map((a, i) => ({ ...a, order: i }));
    setWorkAreas(reordered);

    await aboutApi.reorderWorkAreas(
      reordered.map((a) => ({ id: a.id, order: a.order }))
    );
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <>
      <AdminPageHeader
        title="About"
        description={
          about
            ? `Last updated ${new Date(about.updated_at).toLocaleDateString()}`
            : "Not configured yet"
        }
        actions={
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Basic information displayed on the about page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={form.introduction}
                onChange={(e) => updateField("introduction", e.target.value)}
                rows={5}
              />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="current_title">Current Title</Label>
                <Input
                  id="current_title"
                  value={form.current_title}
                  onChange={(e) =>
                    updateField("current_title", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="current_employer">Current Employer</Label>
                <Input
                  id="current_employer"
                  value={form.current_employer}
                  onChange={(e) =>
                    updateField("current_employer", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="focus">Focus</Label>
                <Input
                  id="focus"
                  value={form.focus}
                  onChange={(e) => updateField("focus", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="interests">Interests</Label>
                <Input
                  id="interests"
                  value={form.interests}
                  onChange={(e) => updateField("interests", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={form.languages}
                  onChange={(e) => updateField("languages", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Areas</CardTitle>
            <CardDescription>
              Areas of expertise displayed on the about page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workAreas.map((area, i) => (
              <div
                key={area.id}
                className="flex items-start gap-2 border border-border p-3"
              >
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <button
                    onClick={() => moveWorkArea(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="size-3" />
                  </button>
                  <GripVertical className="size-3 text-muted-foreground/50" />
                  <button
                    onClick={() => moveWorkArea(i, 1)}
                    disabled={i === workAreas.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="size-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{area.title}</p>
                  {area.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {area.description}
                    </p>
                  )}
                </div>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon-xs">
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  }
                  title="Delete work area?"
                  description={`"${area.title}" will be removed.`}
                  onConfirm={() => deleteWorkArea(area.id)}
                />
              </div>
            ))}

            <div className="border border-dashed border-border p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Work area title"
                  value={newArea.title}
                  onChange={(e) =>
                    setNewArea((p) => ({ ...p, title: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description (optional)"
                  value={newArea.description}
                  onChange={(e) =>
                    setNewArea((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addWorkArea}
                disabled={!newArea.title.trim()}
              >
                <Plus className="size-3.5" />
                Add Work Area
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
