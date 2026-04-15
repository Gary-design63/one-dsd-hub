import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Filter, Gauge, Play, SlidersHorizontal, Sparkles } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type RegionKey = "statewide" | "urban" | "rural" | "suburban" | "tribal";
type HealthTone = "healthy" | "watch" | "focus";

const serviceAccessData = [
  { month: "Jul", urban: 32, rural: 28, suburban: 38, tribal: 22, statewide: 40 },
  { month: "Aug", urban: 33, rural: 29, suburban: 39, tribal: 23, statewide: 41 },
  { month: "Sep", urban: 34, rural: 28, suburban: 40, tribal: 24, statewide: 42 },
  { month: "Oct", urban: 35, rural: 30, suburban: 41, tribal: 25, statewide: 43 },
  { month: "Nov", urban: 36, rural: 31, suburban: 42, tribal: 26, statewide: 43 },
  { month: "Dec", urban: 37, rural: 31, suburban: 43, tribal: 27, statewide: 44 },
  { month: "Jan", urban: 38, rural: 32, suburban: 44, tribal: 28, statewide: 45 },
];

const outcomesByDomain = [
  { name: "Community", value: 34, fill: "hsl(var(--mn-blue))" },
  { name: "Home", value: 29, fill: "hsl(var(--mn-green))" },
  { name: "Occupation", value: 22, fill: "hsl(var(--mn-blue-deep))" },
  { name: "Independence", value: 38, fill: "hsl(var(--chart-blue))" },
  { name: "Connections", value: 31, fill: "hsl(var(--chart-green))" },
  { name: "Equity", value: 27, fill: "hsl(var(--chart-slate))" },
];

const outputsTrend = [
  { month: "Jul '24", documents: 120, trainings: 45 },
  { month: "Aug '24", documents: 135, trainings: 52 },
  { month: "Sep '24", documents: 128, trainings: 48 },
  { month: "Oct '24", documents: 142, trainings: 55 },
  { month: "Nov '24", documents: 150, trainings: 60 },
  { month: "Dec '24", documents: 148, trainings: 58 },
  { month: "Jan '25", documents: 155, trainings: 63 },
];

const recentAgentActivity = [
  { agent: "Policy Drafting Agent", action: "Generated Olmstead progress brief", time: "12 min ago", status: "healthy" as HealthTone },
  { agent: "Equity Data Agent", action: "Analyzed service access across communities", time: "34 min ago", status: "healthy" as HealthTone },
  { agent: "Training Design Agent", action: "Created cultural responsiveness module 3", time: "1 hr ago", status: "healthy" as HealthTone },
  { agent: "Community Outreach Agent", action: "Drafted newsletter for review", time: "2 hr ago", status: "watch" as HealthTone },
  { agent: "DWRS Rate Agent", action: "Calculated 2026 rate impacts by county", time: "3 hr ago", status: "healthy" as HealthTone },
];

const activeGoals = [
  { title: "Improve service access equity across all communities", progress: 34, status: "focus", dueDate: "Jun 2025" },
  { title: "Expand Disability Hub MN community outreach", progress: 72, status: "healthy", dueDate: "Mar 2025" },
  { title: "Complete DSP workforce equity training", progress: 48, status: "watch", dueDate: "Apr 2025" },
  { title: "Publish service outcome data across all populations", progress: 89, status: "healthy", dueDate: "Feb 2025" },
];

const logicModelSteps = [
  {
    title: "Inputs",
    items: ["150–180 DSD staff", "14 agents", "30 community profiles", "Training portfolio", "Static-hostable frontend"],
  },
  {
    title: "Activities",
    items: ["Equity analyses", "Community engagement", "Training delivery", "Consultation routing", "Document formatting"],
  },
  {
    title: "Outputs",
    items: ["Reviewed documents", "Trained staff", "Formatted materials", "Logged decisions"],
  },
  {
    title: "Outcomes",
    items: ["Equitable services", "Community trust", "Culturally responsive practices"],
  },
  {
    title: "Impact",
    items: ["Minnesotans with disabilities live where they choose with the supports they need"],
  },
];

const choiceDomains = [
  { name: "Community", description: "Participation in community life", color: "hsl(var(--mn-blue))" },
  { name: "Home", description: "Living where and with whom you choose", color: "hsl(var(--mn-blue-deep))" },
  { name: "Occupation", description: "Meaningful work and daily activities", color: "hsl(var(--chart-green))" },
  { name: "Independence", description: "Self-determination and personal agency", color: "hsl(var(--mn-green))" },
  { name: "Connections", description: "Relationships and social networks", color: "hsl(var(--chart-blue))" },
  { name: "Equity", description: "Fair access for all communities served", color: "hsl(var(--chart-slate))" },
];

const regionOptions: { key: RegionKey; label: string; stroke: string; fill: string }[] = [
  { key: "statewide", label: "Statewide", stroke: "hsl(var(--chart-slate))", fill: "hsla(var(--chart-slate), 0.14)" },
  { key: "suburban", label: "Suburban", stroke: "hsl(var(--chart-blue))", fill: "hsla(var(--chart-blue), 0.16)" },
  { key: "urban", label: "Urban", stroke: "hsl(var(--mn-green))", fill: "hsla(var(--mn-green), 0.16)" },
  { key: "rural", label: "Rural", stroke: "hsl(var(--mn-blue))", fill: "hsla(var(--mn-blue), 0.14)" },
  { key: "tribal", label: "Tribal Nations", stroke: "hsl(var(--mn-blue-deep))", fill: "hsla(var(--mn-blue-deep), 0.12)" },
];

const highlightPresets = [
  {
    id: "throughput",
    label: "Throughput",
    title: "Operational throughput is holding steady",
    body: "Document review and training delivery remain above the six-month baseline. Rural service access is still the main constraint.",
  },
  {
    id: "equity-gaps",
    label: "Equity gaps",
    title: "The biggest gap remains tribal and rural access",
    body: "The dashboard now lets staff isolate service access by region and quickly compare the most uneven communities before an escalation review.",
  },
  {
    id: "quality",
    label: "Quality gate",
    title: "Quality review is faster than content generation",
    body: "Sniff checks remain fast enough to function as an immediate gate rather than a downstream review step.",
  },
];

const healthConfig: Record<HealthTone, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  watch: { label: "Watch", className: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
  focus: { label: "Focus", className: "bg-rose-500/12 text-rose-700 dark:text-rose-300" },
};

function getProgress(stages: number, active: number) {
  return Math.min(100, Math.round((active / stages) * 100));
}

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("rural");
  const [selectedHighlight, setSelectedHighlight] = useState(highlightPresets[0].id);
  const [showLogicFlow, setShowLogicFlow] = useState(true);
  const [showOnlyFocusGoals, setShowOnlyFocusGoals] = useState(false);

  const selectedRegionMeta = regionOptions.find((option) => option.key === selectedRegion) ?? regionOptions[0];
  const currentRegionValue = serviceAccessData[serviceAccessData.length - 1][selectedRegion];
  const previousRegionValue = serviceAccessData[serviceAccessData.length - 2][selectedRegion];
  const regionDelta = currentRegionValue - previousRegionValue;
  const filteredGoals = showOnlyFocusGoals
    ? activeGoals.filter((goal) => goal.status !== "healthy")
    : activeGoals;
  const selectedCallout = highlightPresets.find((preset) => preset.id === selectedHighlight) ?? highlightPresets[0];

  const topMetrics = useMemo(
    () => [
      {
        label: `${selectedRegionMeta.label} access rate`,
        value: `${currentRegionValue}`,
        detail: regionDelta >= 0 ? `+${regionDelta} since last month` : `${regionDelta} since last month`,
        tone: regionDelta >= 0 ? "healthy" : "watch",
      },
      {
        label: "Sniff check pass rate",
        value: "98.4%",
        detail: "1.2 pts above quarter baseline",
        tone: "healthy",
      },
      {
        label: "Active workflow runs",
        value: "18",
        detail: "3 need leadership review",
        tone: "focus",
      },
      {
        label: "Community action items",
        value: "11",
        detail: "4 awaiting response owner",
        tone: "watch",
      },
    ],
    [currentRegionValue, regionDelta, selectedRegionMeta.label],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6 md:py-6">
      <section className="hero-panel overflow-hidden rounded-[28px] border border-border/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <Badge className="inline-flex rounded-full border-0 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--mn-blue))] shadow-none dark:bg-white/10 dark:text-white">
              Equity operations dashboard
            </Badge>
            <div>
              <h1 className="text-xl font-semibold text-foreground md:text-[1.65rem]">
                <EditableText id="dashboard.title" defaultValue="Equity Operations Dashboard" />
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                <EditableText id="dashboard.subtitle" defaultValue="One DSD Equity and Inclusion Platform · Minnesota Department of Human Services" />
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {highlightPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedHighlight(preset.id)}
                  className={selectedHighlight === preset.id ? "chip-button chip-button-active" : "chip-button"}
                  data-testid={`button-highlight-${preset.id}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 lg:grid-cols-4 xl:w-auto" data-testid="grid-dashboard-metrics">
            {topMetrics.map((metric) => {
              const tone = healthConfig[metric.tone as HealthTone];
              return (
                <div key={metric.label} className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{metric.value}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">{metric.detail}</div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${tone.className}`}>{tone.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-white/50 bg-white/72 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--mn-blue))] text-white shadow-[0_14px_32px_rgba(0,56,101,0.22)]">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{selectedCallout.title}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedCallout.body}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/50 bg-white/72 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Focus region</div>
                <div className="mt-1 text-sm font-semibold text-foreground">{selectedRegionMeta.label}</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--mn-blue-soft))] px-2 py-1 text-xs font-medium text-[hsl(var(--mn-blue))] dark:bg-white/10 dark:text-white">
                {regionDelta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {regionDelta >= 0 ? `+${regionDelta}` : regionDelta}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/workflows" className="flex-1">
                <Button className="w-full rounded-xl bg-[hsl(var(--mn-blue))] text-white hover:bg-[hsl(var(--mn-blue-deep))]" data-testid="link-dashboard-workflows">
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Open workflows
                </Button>
              </Link>
              <Link to="/agents" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl" data-testid="link-dashboard-agents">
                  View agents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageToolbar title="Dashboard" />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="panel-card">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base">Regional service access</CardTitle>
                <CardDescription>Switch regions to update the main trend line and supporting metric immediately.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedRegion(option.key)}
                    className={selectedRegion === option.key ? "chip-button chip-button-active" : "chip-button"}
                    data-testid={`button-region-${option.key}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                <ResponsiveContainer width="100%" height={270}>
                  <AreaChart data={serviceAccessData}>
                    <defs>
                      <linearGradient id="dashboardRegionFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedRegionMeta.stroke} stopOpacity={0.34} />
                        <stop offset="95%" stopColor={selectedRegionMeta.stroke} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ stroke: selectedRegionMeta.stroke, strokeDasharray: "4 4" }} contentStyle={{ fontSize: 12, borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Area type="monotone" dataKey={selectedRegion} name={selectedRegionMeta.label} stroke={selectedRegionMeta.stroke} fill="url(#dashboardRegionFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current score</div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums">{currentRegionValue}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Per 1,000 people with disabilities</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Month-over-month</div>
                  <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums">
                    {regionDelta >= 0 ? <ArrowUpRight className="h-5 w-5 text-emerald-500" /> : <ArrowDownRight className="h-5 w-5 text-rose-500" />}
                    {regionDelta >= 0 ? `+${regionDelta}` : regionDelta}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Compared with prior month</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Priority signal</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">{selectedRegion === "tribal" || selectedRegion === "rural" ? "Escalation candidate" : "Monitor weekly"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Useful immediate review control for dashboard staff</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <Card className="panel-card">
              <CardHeader>
                <CardTitle className="text-base">Outputs trend</CardTitle>
                <CardDescription>Reviewed documents and training delivery across the last seven reporting periods.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={outputsTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }} />
                      <Bar dataKey="documents" name="Documents" radius={[8, 8, 3, 3]} fill="hsl(var(--mn-blue))" />
                      <Bar dataKey="trainings" name="Trainings" radius={[8, 8, 3, 3]} fill="hsl(var(--mn-green))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="panel-card">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Active operational goals</CardTitle>
                  <CardDescription>Toggle focus items to surface the riskiest work first.</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnlyFocusGoals((value) => !value)}
                  className={showOnlyFocusGoals ? "chip-button chip-button-active" : "chip-button"}
                  data-testid="button-toggle-goal-focus"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {showOnlyFocusGoals ? "Showing focus only" : "Show focus only"}
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredGoals.map((goal) => {
                  const tone = healthConfig[goal.status as HealthTone];
                  return (
                    <div key={goal.title} className="rounded-2xl border border-border/60 bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium leading-6 text-foreground">{goal.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">Due {goal.dueDate}</div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${tone.className}`}>{tone.label}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={goal.progress} className="h-2 flex-1" />
                        <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">{goal.progress}%</span>
                      </div>
                    </div>
                  );
                })}
                <Link to="/goals" className="inline-flex text-sm font-medium text-[hsl(var(--mn-blue))] hover:underline" data-testid="link-goals-view-all">
                  View all goals
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="panel-card">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base">Recent agent activity</CardTitle>
                <CardDescription>Latest visible system actions with fast quality-state scanning.</CardDescription>
              </div>
              <Link to="/agents" className="text-sm font-medium text-[hsl(var(--mn-blue))] hover:underline" data-testid="link-agents-activity-view-all">
                View all agents
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAgentActivity.map((activity) => {
                const tone = healthConfig[activity.status];
                return (
                  <div key={`${activity.agent}-${activity.action}`} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{activity.action}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.agent}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-2 py-1 text-[11px] font-medium ${tone.className}`}>{tone.label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="panel-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Logic model flow</CardTitle>
                <CardDescription>Hide or reveal the model to simplify review mode.</CardDescription>
              </div>
              <button
                type="button"
                onClick={() => setShowLogicFlow((value) => !value)}
                className={showLogicFlow ? "chip-button chip-button-active" : "chip-button"}
                data-testid="button-toggle-logic-model"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showLogicFlow ? "Visible" : "Hidden"}
              </button>
            </CardHeader>
            <CardContent>
              {showLogicFlow ? (
                <div className="space-y-3">
                  {logicModelSteps.map((step, index) => (
                    <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-foreground">{step.title}</div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--mn-blue-soft))] text-xs font-semibold text-[hsl(var(--mn-blue))]">{index + 1}</div>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {step.items.map((item) => (
                          <li key={item} className="text-sm leading-6 text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
                  Logic model hidden for a cleaner review view.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">CHOICE domains</CardTitle>
              <CardDescription>Six domain cards tuned for faster scanning and clearer hierarchy.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {choiceDomains.map((domain, index) => (
                  <div key={domain.name} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: domain.color }} />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{domain.name}</div>
                        <div className="mt-1 text-sm leading-6 text-muted-foreground">{domain.description}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">Priority {index + 1}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">Domain progress</CardTitle>
              <CardDescription>Current progress score across all CHOICE domains.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={outcomesByDomain} layout="vertical" margin={{ left: 10, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={88} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 14, borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(value: number) => [`${value}`, "Progress score"]} />
                    <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                      {outcomesByDomain.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
