import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Map, List, Plus, User } from "lucide-react";
import { type ReactNode } from "react";

function NavItem({ to, icon: Icon, label, active }: { to: string; icon: typeof Map; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="flex h-dvh flex-col bg-background">
      <main className="flex-1 overflow-hidden">{children ?? <Outlet />}</main>
      <nav className="bottom-safe flex border-t border-border bg-card shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <NavItem to="/carte" icon={Map} label="Carte" active={pathname.startsWith("/carte")} />
        <NavItem to="/liste" icon={List} label="Liste" active={pathname.startsWith("/liste") || pathname.startsWith("/borne")} />
        <NavItem to="/ajouter" icon={Plus} label="Ajouter" active={pathname.startsWith("/ajouter")} />
        <NavItem to="/profil" icon={User} label="Profil" active={pathname.startsWith("/profil")} />
      </nav>
    </div>
  );
}
