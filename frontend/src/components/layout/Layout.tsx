import { type ReactNode, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { GrainOverlay } from "@/components/shared/GrainOverlay";

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col transition-theme">
      <GrainOverlay />
      <div className="relative z-[1] flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children ?? <Outlet />}</main>
        <Footer />
      </div>
    </div>
  );
}
