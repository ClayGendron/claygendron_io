import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  User,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const navSections: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/about", label: "About", icon: User },
      { to: "/admin/projects", label: "Projects", icon: FolderKanban },
      { to: "/admin/posts", label: "Blog", icon: FileText },
    ],
  },
  {
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function AdminSidebar() {
  const { instance } = useMsal();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" });
  };

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-border">
        <span className="text-sm font-semibold tracking-tight">
          clay admin
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-2 mb-1 text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-2 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-2 py-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed top-3 left-3 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 bg-background border-r border-border transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {nav}
      </aside>
    </>
  );
}
