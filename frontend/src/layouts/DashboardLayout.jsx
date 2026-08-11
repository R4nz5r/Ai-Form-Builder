import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutTemplate,
  Search,
  Moon,
  Sun,
  Plus,
  LogOut,
  Menu,
  X,
  Sparkles,
  Inbox,
  Settings,
  FolderOpen,
  ChevronDown,
  Bell,
} from "lucide-react";
import { cn } from "../lib/utils.js";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import { Logo } from "../components/Logo.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Dropdown, MenuItem, MenuDivider } from "../components/ui/Dropdown.jsx";
import { CommandPalette } from "../components/CommandPalette.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/forms", label: "My Forms", icon: FolderOpen },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/settings", label: "Settings", icon: Settings },
];

/** Rail row that shows just an icon when collapsed and a label when the rail expands. */
function RailItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="mx-3 flex h-11 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-surface-2"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
              isActive
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-muted"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span
            className={cn(
              "whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              isActive ? "text-fg" : "text-muted"
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const profileMenu = (
    <Dropdown
      align="right"
      trigger={
        <button className="flex h-11 items-center gap-2.5 rounded-2xl pl-1.5 pr-2.5 transition-colors hover:bg-surface-2">
          <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[9rem] truncate text-sm font-semibold leading-tight text-fg">{user?.name}</p>
            <p className="max-w-[9rem] truncate text-[11px] text-muted">{user?.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      }
    >
      <div className="px-2.5 py-2 sm:hidden">
        <p className="truncate text-sm font-semibold text-fg">{user?.name}</p>
        <p className="truncate text-xs text-muted">{user?.email}</p>
      </div>
      <MenuItem icon={Settings} onClick={() => navigate("/settings")}>
        Settings
      </MenuItem>
      <MenuDivider />
      <MenuItem icon={LogOut} danger onClick={logout}>
        Log out
      </MenuItem>
    </Dropdown>
  );

  return (
    <div className="flex min-h-screen bg-app">
      {/* Desktop rail (hover to expand) */}
      <div className="hidden w-20 shrink-0 lg:block" aria-hidden />
      <aside className="group fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col overflow-hidden border-r border-default bg-surface py-5 transition-[width] duration-200 ease-out hover:w-64 hover:shadow-pop lg:flex">
        <button onClick={() => navigate("/dashboard")} className="mx-3 flex h-10 items-center gap-3 rounded-xl px-2" aria-label="Home">
          <span className="shrink-0">
            <Logo showText={false} size={36} />
          </span>
          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-fg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Timely Forms <span className="text-brand-600">AI</span>
          </span>
        </button>

        <button
          onClick={() => navigate("/builder/new")}
          className="mx-3 mt-6 flex h-11 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-surface-2"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white shadow-soft transition hover:brightness-[1.06]">
            <Plus className="h-5 w-5" />
          </span>
          <span className="whitespace-nowrap text-sm font-semibold text-fg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            New form
          </span>
        </button>

        <nav className="mt-4 flex flex-col gap-1">
          {NAV.map((item) => (
            <RailItem key={item.to} {...item} />
          ))}
        </nav>

        <button
          onClick={toggle}
          className="mx-3 mt-auto flex h-11 items-center gap-3 rounded-xl px-2 transition-colors hover:bg-surface-2"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center text-muted">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </span>
          <span className="whitespace-nowrap text-sm font-medium text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {isDark ? "Light mode" : "Dark mode"}
          </span>
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNav(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-surface p-4 shadow-pop animate-slide-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button className="text-muted" onClick={() => setMobileNav(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => { navigate("/builder/new"); setMobileNav(false); }}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" /> New form
            </button>
            <nav className="mt-5 flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNav(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200" : "text-muted hover:bg-surface-2 hover:text-fg"
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5" /> {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header — transparent, premium search + control cluster */}
        <header className="flex h-[4.5rem] items-center gap-3 px-4 lg:px-8">
          <button className="text-muted lg:hidden" onClick={() => setMobileNav(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="group flex h-11 w-40 items-center gap-2.5 rounded-2xl border border-default bg-surface px-4 text-sm text-muted shadow-soft transition-all hover:border-brand-300 hover:shadow-card sm:w-64 lg:w-72"
            >
              <Search className="h-4 w-4 transition-colors group-hover:text-brand-500" />
              <span className="truncate">Search…</span>
              <kbd className="ml-auto hidden items-center rounded-lg border border-default bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted sm:flex">⌘K</kbd>
            </button>
            <button
              onClick={() => navigate("/inbox")}
              className="relative grid h-11 w-11 place-items-center rounded-2xl border border-default bg-surface text-muted shadow-soft transition-all hover:border-brand-300 hover:text-fg"
              aria-label="Inbox"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-surface" />
            </button>
            <button
              onClick={toggle}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-default bg-surface text-muted shadow-soft transition-all hover:border-brand-300 hover:text-fg"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            {profileMenu}
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </div>
  );
}
