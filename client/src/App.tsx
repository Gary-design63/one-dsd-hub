import React, { useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Search,
  SunMedium,
  Workflow,
  Zap,
} from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditProvider, useEditContext } from "@/context/EditContext";
import { useAuth } from "@/context/AuthContext";
import { AccessibilityBar, SkipLink } from "@/components/AccessibilityBar";
import Dashboard from "@/pages/Dashboard";
import AgentsPage from "@/pages/AgentsPage";
import AgentChat from "@/pages/AgentChat";
import CommunityPage from "@/pages/CommunityPage";
import TrainingPage from "@/pages/TrainingPage";
import GoalsPage from "@/pages/GoalsPage";
import PolicyPage from "@/pages/PolicyPage";
import EquityMetricsPage from "@/pages/EquityMetricsPage";
import SettingsPage from "@/pages/SettingsPage";
import CompletionChecklist from "@/pages/CompletionChecklist";
import KnowledgeBasePage from "@/pages/KnowledgeBasePage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import EquityAssistPage from "@/pages/EquityAssistPage";

interface NavItem {
  label: string;
  path: string;
  group: string;
  shortLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", group: "Operations", shortLabel: "Overview" },
  { label: "Agents", path: "/agents", group: "Operations", shortLabel: "Agents" },
  { label: "Equity Assist", path: "/equity-assist", group: "Operations", shortLabel: "Assist" },
  { label: "Equity Metrics", path: "/metrics", group: "Analysis", shortLabel: "Metrics" },
  { label: "Policy Documents", path: "/policy", group: "Analysis", shortLabel: "Policy" },
  { label: "Knowledge Base", path: "/knowledge", group: "Analysis", shortLabel: "Knowledge" },
  { label: "Workflows", path: "/workflows", group: "Processes", shortLabel: "Runs" },
  { label: "Templates", path: "/templates", group: "Processes", shortLabel: "Templates" },
  { label: "Communities", path: "/community", group: "Community", shortLabel: "Communities" },
  { label: "Training", path: "/training", group: "Learning", shortLabel: "Training" },
  { label: "Goals", path: "/goals", group: "Learning", shortLabel: "Goals" },
  { label: "Checklist", path: "/checklist", group: "Learning", shortLabel: "Checklist" },
  { label: "Settings", path: "/settings", group: "System", shortLabel: "Settings" },
];

const NAV_GROUPS = ["Operations", "Analysis", "Processes", "Community", "Learning", "System"];

function getPageSummary(pathname: string) {
  if (pathname.startsWith("/agents")) {
    return { metric: "14 active", label: "agents online", icon: Zap };
  }
  if (pathname.startsWith("/workflows")) {
    return { metric: "18 running", label: "workflow runs", icon: Workflow };
  }
  if (pathname === "/") {
    return { metric: "98.4%", label: "quality gate pass rate", icon: LayoutGrid };
  }
  return { metric: "Live", label: "workspace ready", icon: Bell };
}

function Sidebar({ isOpen, isCollapsed, onClose, onToggle }: { isOpen: boolean; isCollapsed: boolean; onClose: () => void; onToggle: () => void }) {
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "app-sidebar fixed inset-y-0 left-0 z-50 flex h-full transform flex-col border-r border-white/10 bg-[hsl(var(--sidebar-panel))] text-white transition-all duration-300 ease-out lg:static lg:z-auto lg:translate-x-0",
          isCollapsed ? "w-[92px]" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <svg viewBox="0 0 40 40" className="h-7 w-7 text-white" aria-label="One DSD logo" fill="none">
                <path d="M9 28V12h9.5c4.7 0 7.5 2.9 7.5 8s-2.8 8-7.5 8H9Z" fill="currentColor" opacity="0.16" />
                <path d="M14 12h5.1c4 0 6.4 2.8 6.4 8s-2.4 8-6.4 8H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28.5 11.5v17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28.5 28.5c3.1 0 5.5-1.8 5.5-4.2 0-2.6-2.2-3.7-5.1-4.4-2.6-.7-5.1-1.4-5.1-4 0-2.4 2.1-4.4 5.4-4.4 1.8 0 3.5.5 5 1.7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-[0.18em] text-white/65 uppercase">One DSD</div>
                <div className="truncate text-base font-semibold text-white">Equity operations</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="hidden rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white lg:inline-flex"
              aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              data-testid="button-toggle-sidebar"
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/65 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
              data-testid="button-close-sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn("border-b border-white/10", isCollapsed ? "px-3 py-3" : "px-4 py-4") }>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center") }>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--mn-gold)/0.18)] text-[hsl(var(--mn-gold))]">
                <Zap className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Directive</div>
                  <div className="text-sm font-medium text-white">Multiply consultant capacity</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className={cn("flex-1 overflow-y-auto pb-6", isCollapsed ? "px-3 pt-3" : "px-4 pt-4")} aria-label="Main navigation">
          <div className="space-y-4">
            {NAV_GROUPS.map((group) => {
              const items = NAV_ITEMS.filter((item) => item.group === group);
              return (
                <div key={group} className="space-y-2">
                  {!isCollapsed && (
                    <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">{group}</div>
                  )}
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          data-testid={`link-nav-${item.shortLabel.toLowerCase()}`}
                          className={cn(
                            "group flex items-center rounded-2xl transition-all duration-200",
                            isCollapsed ? "justify-center px-3 py-3" : "justify-between gap-3 px-3 py-2.5",
                            isActive
                              ? "bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.24)]"
                              : "text-white/70 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <div className="min-w-0">
                            <div className={cn("text-sm font-medium", isCollapsed && "sr-only")}>{item.label}</div>
                            {!isCollapsed && <div className={cn("text-xs", isActive ? "text-slate-500" : "text-white/40")}>{item.group}</div>}
                          </div>
                          {!isCollapsed && (
                            <div className={cn("h-2 w-2 rounded-full", isActive ? "bg-[hsl(var(--mn-green))]" : "bg-white/15 group-hover:bg-white/35")} />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className={cn("border-t border-white/10", isCollapsed ? "px-3 py-3" : "px-4 py-4")}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-white/70">
            {!isCollapsed ? (
              <>
                <div className="text-xs uppercase tracking-[0.18em] text-white/40">Status</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>App shell</span>
                  <span className="font-medium text-white">Ready</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span>Static mode</span>
                  <span className="font-medium text-white">Client-only</span>
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--mn-green))]" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({
  onMenuClick,
  zoom,
  onZoomChange,
  theme,
  onToggleTheme,
  isSidebarCollapsed,
}: {
  onMenuClick: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isSidebarCollapsed: boolean;
}) {
  const location = useLocation();
  const { isEditing, toggleEditing, handleSave, handleDownload, handleUpload } = useEditContext();
  const uploadRef = useRef<HTMLInputElement>(null);
  const currentNav = NAV_ITEMS.find((item) => (item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)));
  const pageSummary = useMemo(() => getPageSummary(location.pathname), [location.pathname]);
  const SummaryIcon = pageSummary.icon;

  return (
    <>
      <div className="header-accent h-1" />
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            onClick={onMenuClick}
            className="inline-flex rounded-xl border border-border/70 bg-card p-2 text-muted-foreground transition hover:text-foreground lg:hidden"
            aria-label="Open menu"
            data-testid="button-open-menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span>One DSD</span>
              <span className="text-border">/</span>
              <span>{currentNav?.group ?? "Operations"}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-3">
              <h1 className="truncate text-lg font-semibold text-foreground">{currentNav?.label || "Platform"}</h1>
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/80 px-2.5 py-1 text-xs text-muted-foreground md:flex">
                <SummaryIcon className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">{pageSummary.metric}</span>
                <span>{pageSummary.label}</span>
              </div>
            </div>
          </div>

          <div className={cn("ml-auto flex items-center gap-2", isSidebarCollapsed ? "xl:gap-3" : "xl:gap-2") }>
            <label className="header-search hidden md:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents, documents, workflows"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
                aria-label="Search the platform"
                data-testid="input-global-search"
              />
            </label>

            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="h-9 rounded-xl bg-[hsl(var(--mn-green))] px-3 text-xs font-semibold text-white hover:bg-[hsl(var(--mn-green-strong))]" data-testid="button-save-shell">
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={toggleEditing} className="h-9 rounded-xl text-xs" data-testid="button-cancel-shell">
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={toggleEditing} className="h-9 rounded-xl text-xs" data-testid="button-edit-shell">
                Edit
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-xl gap-1.5 text-xs"
              onClick={() => uploadRef.current?.click()}
              aria-label="Import file"
              data-testid="button-import-shell"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <input
              ref={uploadRef}
              type="file"
              accept=".json,audio/*,video/*,image/*,.pdf,.doc,.docx,.txt,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />

            <Button size="sm" variant="outline" onClick={handleDownload} className="hidden h-9 rounded-xl text-xs lg:inline-flex" data-testid="button-download-shell">
              Download
            </Button>

            <button
              onClick={onToggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition hover:text-foreground"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden lg:flex lg:items-center lg:gap-1 lg:rounded-xl lg:border lg:border-border/70 lg:bg-card lg:px-2 lg:py-1">
              <AccessibilityBar zoom={zoom} onZoomChange={onZoomChange} />
            </div>

            <button className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition hover:text-foreground xl:inline-flex" aria-label="Notifications" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
            </button>

            <UserBadge />
          </div>
        </div>
      </header>
    </>
  );
}

function UserBadge() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-1.5" data-testid="badge-user-anon">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">?</div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-2 py-1.5" data-testid="badge-user-authenticated">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">{initials}</div>
      <div className="hidden xl:flex xl:flex-col">
        <span className="text-xs font-semibold text-foreground leading-tight">{user.name}</span>
        <span className="text-[11px] capitalize text-muted-foreground leading-tight">{user.role.replace(/-/g, " ")}</span>
      </div>
      <button onClick={logout} className="text-muted-foreground transition hover:text-foreground" title="Sign out" aria-label="Sign out" data-testid="button-signout">
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState<"light" | "dark">(() => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="app-shell min-h-screen bg-background text-foreground lg:h-screen lg:overflow-hidden">
      <SkipLink />
      <div className="flex min-h-screen lg:h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:h-screen">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            zoom={zoom}
            onZoomChange={setZoom}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            isSidebarCollapsed={sidebarCollapsed}
          />
          <main id="main-content" className="flex-1 overflow-auto" style={{ fontSize: `${zoom}%` }} tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:agentId" element={<AgentChat />} />
              <Route path="/equity-assist" element={<EquityAssistPage />} />
              <Route path="/metrics" element={<EquityMetricsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/knowledge" element={<KnowledgeBasePage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/checklist" element={<CompletionChecklist />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-border/70 bg-background/90 px-6 py-3 text-xs text-muted-foreground">
            Minnesota Department of Human Services · Disability Services Division · static frontend shell · 2026
          </footer>
        </div>
      </div>
      <Toaster position="top-right" richColors toastOptions={{ classNames: { toast: "font-sans" } }} />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-3xl border border-border/70 bg-card px-8 py-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--mn-blue))] text-white shadow-[0_14px_30px_rgba(0,56,101,0.22)]">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">Loading workspace</p>
          <p className="mt-1 text-xs text-muted-foreground">Preparing the equity operations shell.</p>
        </div>
      </div>
    );
  }

  return (
    <EditProvider>
      <AppShell />
    </EditProvider>
  );
}
