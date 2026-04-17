import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, ShieldCheck, SlidersHorizontal, Sparkles, TimerReset, Zap } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Agent } from "@/types";

const AGENTS: Agent[] = [
  {
    id: "policy-drafting",
    name: "Policy Drafting Agent",
    description: "Drafts equity-aligned policy documents, testimony, guidance memos, and legislative briefs. Applies all 39 meta-skills. Outputs are draft-ready, never placeholder.",
    category: "policy",
    status: "active",
    capabilities: ["Policy briefs", "Legislative testimony", "Guidance memos", "Olmstead compliance review", "Equity impact analysis", "CBSM interpretation"],
    metaSkillsDomains: ["M1", "M2", "M4"],
    color: "hsl(var(--mn-blue))",
    messageCount: 842,
    successRate: 99.2,
    averageResponseTime: 18,
    tags: ["high-use", "policy", "olmstead"],
  },
  {
    id: "equity-data",
    name: "Equity Data Agent",
    description: "Analyzes disaggregated disability services data by race, ethnicity, geography, and disability type. Identifies disparities, generates visualizations, and proposes data-driven solutions.",
    category: "data",
    status: "active",
    capabilities: ["Disparity analysis", "Disaggregated data reports", "Equity dashboards", "Root cause analysis", "Trend identification", "MMIS data interpretation"],
    metaSkillsDomains: ["M1", "M3"],
    color: "hsl(var(--chart-green))",
    messageCount: 623,
    successRate: 97.8,
    averageResponseTime: 22,
    tags: ["data", "analytics", "equity"],
  },
  {
    id: "training-design",
    name: "Training Design Agent",
    description: "Creates complete equity training curricula, modules, facilitator guides, and assessments. Ensures ADA accessibility, plain language, and adult learning best practices.",
    category: "training",
    status: "active",
    capabilities: ["Curriculum development", "Module design", "Assessment creation", "Facilitator guides", "Accessibility review", "Learning objective writing"],
    metaSkillsDomains: ["M2", "M5", "M6"],
    color: "hsl(var(--chart-amber))",
    messageCount: 415,
    successRate: 98.7,
    averageResponseTime: 31,
    tags: ["training", "curriculum", "accessibility"],
  },
  {
    id: "community-outreach",
    name: "Community Outreach Agent",
    description: "Creates culturally responsive outreach materials for BIPOC disability communities. Supports East African, Hmong, Latinx, and Indigenous community engagement. Language justice focused.",
    category: "community",
    status: "active",
    capabilities: ["Community newsletters", "Outreach scripts", "Event planning", "Cultural adaptation", "Trusted messenger support", "Language access planning"],
    metaSkillsDomains: ["M2", "M6"],
    color: "hsl(var(--chart-rose))",
    messageCount: 389,
    successRate: 96.4,
    averageResponseTime: 25,
    tags: ["community", "outreach", "language-access"],
  },
  {
    id: "dwrs-rate",
    name: "DWRS Rate Analysis Agent",
    description: "Analyzes Disability Waiver Rate System rate impacts, models 2026 transitions, calculates equity implications of rate changes, and supports provider sustainability analysis.",
    category: "waiver",
    status: "active",
    capabilities: ["Rate modeling", "2026 transition analysis", "Provider sustainability", "DSP wage analysis", "Geographic equity", "Budget impact projections"],
    metaSkillsDomains: ["M3", "M4", "M5"],
    color: "hsl(var(--mn-blue-deep))",
    messageCount: 278,
    successRate: 98.2,
    averageResponseTime: 28,
    tags: ["dwrs", "rates", "finance"],
  },
  {
    id: "olmstead-monitor",
    name: "Olmstead Monitoring Agent",
    description: "Tracks Minnesota Olmstead Plan progress, identifies compliance gaps, generates transition planning support, and monitors community integration outcomes.",
    category: "compliance",
    status: "active",
    capabilities: ["Progress monitoring", "Compliance gap analysis", "Transition planning", "Community integration reports", "Institutional to community tracking", "Subcabinet reporting"],
    metaSkillsDomains: ["M1", "M4"],
    color: "hsl(var(--mn-blue))",
    messageCount: 195,
    successRate: 99.5,
    averageResponseTime: 20,
    tags: ["olmstead", "compliance", "community-integration"],
  },
  {
    id: "employment-first",
    name: "Employment First Agent",
    description: "Supports Employment First policy implementation. Analyzes employment outcome disparities, creates supported employment training content, and generates Employment First compliance materials.",
    category: "employment",
    status: "active",
    capabilities: ["Employment outcome analysis", "VRS coordination", "Provider training", "Customized employment planning", "Disparity reporting", "Policy compliance review"],
    metaSkillsDomains: ["M1", "M3", "M4"],
    color: "hsl(var(--chart-green))",
    messageCount: 167,
    successRate: 97.6,
    averageResponseTime: 24,
    tags: ["employment-first", "vrs", "outcomes"],
  },
  {
    id: "waiver-navigator",
    name: "Waiver Navigation Agent",
    description: "Helps staff and community partners navigate CADI, DD, BI, EW, and AC waiver programs. Creates plain-language guides, eligibility explanations, and service planning support.",
    category: "waiver",
    status: "active",
    capabilities: ["Waiver comparison", "Eligibility guidance", "Service descriptions", "Plain language summaries", "CBSM navigation", "Person-centered planning support"],
    metaSkillsDomains: ["M2", "M4"],
    color: "hsl(var(--mn-blue))",
    messageCount: 543,
    successRate: 98.9,
    averageResponseTime: 16,
    tags: ["waiver", "navigation", "plain-language"],
  },
  {
    id: "hcbs-settings",
    name: "HCBS Settings Compliance Agent",
    description: "Reviews provider settings for HCBS Settings Rule compliance. Conducts virtual site review assessments, generates remediation plans, and tracks compliance timelines.",
    category: "compliance",
    status: "active",
    capabilities: ["Settings review", "Compliance checklist", "Remediation planning", "Site assessment", "Provider guidance", "Institutional settings identification"],
    metaSkillsDomains: ["M4", "M5"],
    color: "hsl(var(--chart-amber))",
    messageCount: 134,
    successRate: 99.1,
    averageResponseTime: 35,
    tags: ["hcbs", "compliance", "settings-rule"],
  },
  {
    id: "stakeholder-engagement",
    name: "Stakeholder Engagement Agent",
    description: "Designs and manages stakeholder engagement processes, creates meeting materials, generates follow-up summaries, and tracks action items from advisory panels and community sessions.",
    category: "community",
    status: "active",
    capabilities: ["Meeting facilitation guides", "Advisory panel design", "Engagement strategy", "Action item tracking", "Community input synthesis", "Accessibility planning"],
    metaSkillsDomains: ["M5", "M6"],
    color: "hsl(var(--chart-green))",
    messageCount: 201,
    successRate: 97.3,
    averageResponseTime: 27,
    tags: ["engagement", "stakeholders", "advisory"],
  },
  {
    id: "legislative-affairs",
    name: "Legislative Affairs Agent",
    description: "Monitors Minnesota legislative session, tracks disability equity bills, drafts testimony and comment letters, generates legislative impact analyses for equity implications.",
    category: "policy",
    status: "active",
    capabilities: ["Bill tracking", "Testimony drafting", "Comment letters", "Legislative impact analysis", "Session monitoring", "Budget request support"],
    metaSkillsDomains: ["M2", "M4"],
    color: "hsl(var(--mn-blue))",
    messageCount: 88,
    successRate: 98.8,
    averageResponseTime: 33,
    tags: ["legislative", "testimony", "policy"],
  },
  {
    id: "disability-hub",
    name: "Disability Hub MN Agent",
    description: "Supports Disability Hub MN resource navigation, benefits counseling scripts, and community connection workflows. Creates accessible resource guides in multiple languages.",
    category: "operations",
    status: "active",
    capabilities: ["Benefits navigation", "Resource guides", "Multilingual materials", "Community referrals", "Work incentives planning", "Hub coordination"],
    metaSkillsDomains: ["M2", "M6"],
    color: "hsl(var(--chart-green))",
    messageCount: 312,
    successRate: 98.1,
    averageResponseTime: 19,
    tags: ["disability-hub", "benefits", "navigation"],
  },
  {
    id: "communications",
    name: "Communications Agent",
    description: "Drafts all external communications: press releases, DHS website content, social media, executive communications, and community-facing announcements. Multiple format and audience support.",
    category: "communications",
    status: "active",
    capabilities: ["Press releases", "Web content", "Social media", "Executive memos", "Newsletters", "Infographic scripts", "FAQ documents"],
    metaSkillsDomains: ["M2", "M5"],
    color: "hsl(var(--chart-rose))",
    messageCount: 447,
    successRate: 97.9,
    averageResponseTime: 21,
    tags: ["communications", "content", "web"],
  },
  {
    id: "meta-audit",
    name: "Meta-Audit and QA Agent",
    description: "Runs L1/L2/L3 Sniff Checks on all agent outputs. Reviews for equity alignment, ableist language, structural analysis quality, and force multiplier compliance. Quality gate for the platform.",
    category: "operations",
    status: "active",
    capabilities: ["L1 automated checks", "L2 equity review", "L3 expert validation", "Language audits", "Structural analysis review", "Output quality scoring"],
    metaSkillsDomains: ["M1", "M2", "M3", "M4", "M5", "M6"],
    color: "hsl(var(--mn-blue))",
    messageCount: 1247,
    successRate: 99.8,
    averageResponseTime: 8,
    tags: ["quality", "audit", "sniff-check"],
  },
];

const categoryLabels: Record<string, string> = {
  policy: "Policy",
  data: "Data",
  training: "Training",
  community: "Community",
  operations: "Operations",
  communications: "Communications",
  compliance: "Compliance",
  employment: "Employment",
  waiver: "Waiver",
};

const categoryColors: Record<string, string> = {
  policy: "bg-[hsl(var(--mn-blue-soft))] text-[hsl(var(--mn-blue))]",
  data: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  training: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  community: "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300",
  operations: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
  communications: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  compliance: "bg-red-500/12 text-red-700 dark:text-red-300",
  employment: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  waiver: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
};

const scorePresets = [
  { id: "all", label: "All agents" },
  { id: "elite", label: "98.5%+ success" },
  { id: "fast", label: "Under 20s response" },
];

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"usage" | "success" | "response">("usage");
  const [compareList, setCompareList] = useState<string[]>([]);

  const filteredAgents = useMemo(() => {
    const bySearch = AGENTS.filter((agent) => {
      const matchesSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags?.some((tag) => tag.includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;
      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "elite" && (agent.successRate ?? 0) >= 98.5) ||
        (scoreFilter === "fast" && (agent.averageResponseTime ?? 999) < 20);

      return matchesSearch && matchesCategory && matchesScore;
    });

    return [...bySearch].sort((a, b) => {
      if (sortBy === "success") return (b.successRate ?? 0) - (a.successRate ?? 0);
      if (sortBy === "response") return (a.averageResponseTime ?? 0) - (b.averageResponseTime ?? 0);
      return (b.messageCount ?? 0) - (a.messageCount ?? 0);
    });
  }, [categoryFilter, scoreFilter, searchQuery, sortBy]);

  const totalMessages = AGENTS.reduce((sum, agent) => sum + (agent.messageCount || 0), 0);
  const avgSuccessRate = AGENTS.reduce((sum, agent) => sum + (agent.successRate || 0), 0) / AGENTS.length;
  const fastestAverage = Math.min(...AGENTS.map((agent) => agent.averageResponseTime || 999));
  const compareAgents = AGENTS.filter((agent) => compareList.includes(agent.id));

  const toggleCompare = (id: string) => {
    setCompareList((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= 3) return [...current.slice(1), id];
      return [...current, id];
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6 md:py-6">
      <section className="hero-panel rounded-[28px] border border-border/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--mn-blue))] dark:border-white/10 dark:bg-white/5 dark:text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Equity agents
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground md:text-[1.65rem]">
                <EditableText id="agents.title" defaultValue="Equity Agents" />
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                <EditableText id="agents.subtitle" defaultValue={`${AGENTS.length} specialized agents · All governed by the Primary Directive · Client-side triage and comparison now active`} />
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Active agents", value: AGENTS.length, icon: Zap },
              { label: "Tasks completed", value: totalMessages.toLocaleString(), icon: ArrowUpRight },
              { label: "Avg pass rate", value: `${avgSuccessRate.toFixed(1)}%`, icon: ShieldCheck },
              { label: "Fastest average", value: `${fastestAverage}s`, icon: TimerReset },
            ].map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/55 bg-white/72 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3 text-muted-foreground">
                  <span className="text-[11px] uppercase tracking-[0.16em]">{metric.label}</span>
                  <metric.icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageToolbar title="Agents" />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="panel-card">
            <CardHeader className="gap-4">
              <div>
                <CardTitle className="text-base">Find the right agent quickly</CardTitle>
                <CardDescription>Search, filter, sort, and compare agents without leaving the page.</CardDescription>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_180px_180px_160px]">
                <label className="header-search md:min-w-0">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents, capabilities, or tags"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    data-testid="input-agent-search"
                  />
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="rounded-xl" data-testid="select-agent-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="rounded-xl" data-testid="select-agent-score-filter">
                    <SelectValue placeholder="Score filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {scorePresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: "usage" | "success" | "response") => setSortBy(value)}>
                  <SelectTrigger className="rounded-xl" data-testid="select-agent-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage">Most used</SelectItem>
                    <SelectItem value="success">Best pass rate</SelectItem>
                    <SelectItem value="response">Fastest response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAgents.map((agent) => {
              const isCompared = compareList.includes(agent.id);
              return (
                <Card key={agent.id} className={isCompared ? "panel-card border-[hsl(var(--mn-blue))] shadow-[0_20px_48px_rgba(0,56,101,0.12)]" : "panel-card"} data-testid={`card-agent-${agent.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40" style={{ boxShadow: `inset 0 0 0 1px ${agent.color}20` }}>
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: agent.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold leading-6">
                            <EditableText id={`agent.${agent.id}.name`} defaultValue={agent.name} />
                          </CardTitle>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${categoryColors[agent.category]}`}>{categoryLabels[agent.category]}</span>
                            <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Active</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompare(agent.id)}
                        className={isCompared ? "chip-button chip-button-active" : "chip-button"}
                        data-testid={`button-compare-${agent.id}`}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        {isCompared ? "Added" : "Compare"}
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <EditableText id={`agent.${agent.id}.desc`} defaultValue={agent.description} multiline className="text-sm leading-6 text-muted-foreground line-clamp-4" />

                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.slice(0, 4).map((capability) => (
                        <span key={capability} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {capability}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3 text-center">
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tasks</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.messageCount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pass</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.successRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Avg</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.averageResponseTime}s</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Meta-skills:</span>
                      {agent.metaSkillsDomains.map((domain) => (
                        <span key={domain} className="rounded-full bg-[hsl(var(--mn-blue-soft))] px-2 py-1 font-medium text-[hsl(var(--mn-blue))]">
                          {domain}
                        </span>
                      ))}
                    </div>

                    <Link to={`/agents/${agent.id}`} className="block" data-testid={`link-open-agent-${agent.id}`}>
                      <Button className="w-full rounded-xl bg-[hsl(var(--mn-blue))] text-white hover:bg-[hsl(var(--mn-blue-deep))]" size="sm">
                        Open agent
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center text-muted-foreground" data-testid="empty-agents-results">
              <p className="text-lg font-medium text-foreground">No agents match this view</p>
              <p className="mt-2 text-sm">Try a broader search, or reset one of the active filters.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">Compare shortlist</CardTitle>
              <CardDescription>Select up to three agents to compare usage, quality, and speed side by side.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {compareAgents.length > 0 ? (
                compareAgents.map((agent) => (
                  <div key={agent.id} className="rounded-2xl border border-border/60 bg-card p-4" data-testid={`compare-agent-${agent.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{agent.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{categoryLabels[agent.category]}</div>
                      </div>
                      <button type="button" onClick={() => toggleCompare(agent.id)} className="text-xs font-medium text-[hsl(var(--mn-blue))] hover:underline" data-testid={`button-remove-compare-${agent.id}`}>
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-muted/30 px-2 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tasks</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.messageCount}</div>
                      </div>
                      <div className="rounded-xl bg-muted/30 px-2 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Pass</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.successRate}%</div>
                      </div>
                      <div className="rounded-xl bg-muted/30 px-2 py-2">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Avg</div>
                        <div className="mt-1 text-sm font-semibold tabular-nums">{agent.averageResponseTime}s</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground" data-testid="empty-agent-compare">
                  Use the Compare button on any agent card to build a shortlist here.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">Live roster signals</CardTitle>
              <CardDescription>Instantly useful filters now shape the visible roster instead of just styling the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scorePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setScoreFilter(preset.id)}
                  className={scoreFilter === preset.id ? "chip-button chip-button-active w-full justify-center" : "chip-button w-full justify-center"}
                  data-testid={`button-score-preset-${preset.id}`}
                >
                  {preset.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
