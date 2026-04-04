import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchCurrentUser } from "@/admin/lib/api";
import { LoginPage } from "./LoginPage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      setState(user ? "authenticated" : "unauthenticated");
    });
  }, []);

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <LoginPage />;
  }

  return <>{children}</>;
}
