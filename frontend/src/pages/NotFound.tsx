import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/shared/SectionHeader";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center px-[var(--page-gutter)]">
      <SectionHeader label="404" />
      <h1 className="font-serif text-3xl md:text-4xl mb-4 text-center">
        Page not found
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        Back to home
      </Link>
    </main>
  );
}
