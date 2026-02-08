import { useState, useEffect } from "react";
import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create a shared Shiki highlighter instance
 */
async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "javascript",
        "typescript",
        "python",
        "rust",
        "sql",
        "json",
        "yaml",
        "markdown",
        "bash",
        "shell",
        "tsx",
        "jsx",
        "css",
        "html",
      ],
    });
  }
  return highlighterPromise;
}

export function useShiki() {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getHighlighter()
      .then(setHighlighter)
      .finally(() => setIsLoading(false));
  }, []);

  const highlight = (code: string, lang: string, theme: "light" | "dark") => {
    if (!highlighter) return code;

    try {
      return highlighter.codeToHtml(code, {
        lang: lang || "text",
        theme: theme === "dark" ? "github-dark" : "github-light",
      });
    } catch {
      // If language isn't supported, return plain text
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  };

  return { highlighter, highlight, isLoading };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
