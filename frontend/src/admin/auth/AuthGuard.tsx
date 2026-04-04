import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { RefreshCw } from "lucide-react";
import { LoginPage } from "./LoginPage";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
