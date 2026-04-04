import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center justify-center size-12 bg-primary/10">
              <Lock className="size-5 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to manage site content
              </p>
            </div>
          </div>
          <Button onClick={handleLogin} size="lg" className="w-full">
            Sign in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
