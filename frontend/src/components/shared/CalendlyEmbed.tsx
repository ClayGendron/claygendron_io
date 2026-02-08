import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

interface CalendlyEmbedProps {
  url: string;
  className?: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

export function CalendlyEmbed({ url, className }: CalendlyEmbedProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://assets.calendly.com/assets/external/widget.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Add theme colors to Calendly URL
  const themedUrl = `${url}?hide_gdpr_banner=1&background_color=${
    resolvedTheme === "dark" ? "1f1f1f" : "ffffff"
  }&text_color=${resolvedTheme === "dark" ? "e5e5e5" : "1a1a1a"}&primary_color=d97706`;

  return (
    <div
      className={className}
      data-url={themedUrl}
      style={{ minWidth: "320px", height: "100%" }}
    >
      <div
        className="calendly-inline-widget"
        data-url={themedUrl}
        style={{ minWidth: "320px", height: "100%", width: "100%" }}
      />
    </div>
  );
}
