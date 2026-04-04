import { Badge } from "@/components/ui/badge";

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "default" : "outline"}>
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
