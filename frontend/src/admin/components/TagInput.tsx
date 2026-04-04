import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div
      className="border-input bg-input/20 dark:bg-input/30 flex min-h-7 w-full flex-wrap items-center gap-1.5 border px-2 py-1 text-xs transition-colors focus-within:border-ring focus-within:ring-ring/30 focus-within:ring-[2px]"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <Badge key={tag} variant="tag" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
