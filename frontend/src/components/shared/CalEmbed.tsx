import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

let instanceCounter = 0;

interface CalEmbedProps {
  calLink: string;
  className?: string;
}

export function CalEmbed({ calLink, className }: CalEmbedProps) {
  const { resolvedTheme } = useTheme();
  const nsRef = useRef(`cal-${++instanceCounter}`);
  const ns = nsRef.current;

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: ns });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        theme: resolvedTheme === "dark" ? "dark" : "light",
      });
    })();
  }, [resolvedTheme, ns]);

  return (
    <div className={className}>
      <Cal
        namespace={ns}
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        config={{
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true",
          theme: resolvedTheme === "dark" ? "dark" : "light",
        }}
      />
    </div>
  );
}
