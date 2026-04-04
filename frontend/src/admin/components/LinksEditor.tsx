import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinksEditorProps {
  value: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
}

export function LinksEditor({ value, onChange }: LinksEditorProps) {
  const entries = Object.entries(value);

  const updateEntry = (
    oldKey: string,
    field: "key" | "value",
    newValue: string
  ) => {
    const result: Record<string, string> = {};
    for (const [k, v] of entries) {
      if (k === oldKey) {
        const newKey = field === "key" ? newValue : k;
        const newVal = field === "value" ? newValue : v;
        result[newKey] = newVal;
      } else {
        result[k] = v;
      }
    }
    onChange(result);
  };

  const addEntry = () => {
    // Find a unique placeholder key
    let key = "";
    let i = 1;
    while (key in value || key === "") {
      key = `link${i}`;
      i++;
    }
    onChange({ ...value, [key]: "" });
  };

  const removeEntry = (key: string) => {
    const result = { ...value };
    delete result[key];
    onChange(result);
  };

  return (
    <div className="space-y-2">
      {entries.map(([key, url]) => (
        <div key={key} className="flex items-center gap-2">
          <Input
            value={key}
            onChange={(e) => updateEntry(key, "key", e.target.value)}
            placeholder="Label"
            className="w-32 shrink-0"
          />
          <Input
            value={url}
            onChange={(e) => updateEntry(key, "value", e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeEntry(key)}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
      >
        <Plus className="size-3.5" />
        Add Link
      </Button>
    </div>
  );
}
