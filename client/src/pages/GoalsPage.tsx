import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GoalStatus = "not_started" | "in_progress" | "on_track" | "at_risk" | "completed" | "cancelled";
type GoalPriority = "critical" | "high" | "medium" | "low";
type GoalCategory = "equity_access" | "workforce_development" | "policy_change" | "data_transparency" | "community_voice" | "olmstead" | "employment_first" | "language_access" | "provider_diversity" | "training";

interface KeyResult {
  description: string;
  target: number;
  current: number;
  unit: string;
  status: GoalStatus;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  owner: string;
  startDate: string;
  targetDate: string;
  progressPercent: number;
  keyResults: KeyResult[];
  relatedCommunities?: string[];
  equityImpact?: string;
  tags?: string[];
}

const goals: Goal[] = [
  {
    id: "g1",
    title: "Reduce BIPOC waiver waitlist by 15% by June 2025",
    description: "Targeted outreach and navigation support to reduce disproportionate BIPOC representation on waiver waitlists through county partnerships and Disability Hub MN.",
    category: "equity_access",
    priority: "critical",
    status: "on_track",
    owner: "DSD Access Team",
    startDate: "Jan 2025",
    targetDate: "Jun 2025",
    progressPercent: 34,
    keyResults: [
      { description: "Reduction in BIPOC share of total waitlist", target: 15, current: 5.1, unit: "%", status: "in_progress" },
      { description: "New culturally-specific outreach contacts made", target: 500, current: 287, unit: "contacts", status: "on_track" },
      { description: "County navigation partnerships established", target: 12, current: 8, unit: "counties", status: "on_track" }
    ],
    relatedCommunities: ["Black/African American", "Somali/East African", "Indigenous"],
    equityImpact: "Reduces racial disparity in waiver access — addresses root cause of structural barriers",
    tags: ["waitlist", "access", "bipoc"]
  },
  {
    id: "g2",
    title: "Launch Disability Hub MN Somali community outreach",
    description: "Partner with Somali community organizations to train trusted messengers and distribute Hub resources in Somali language across Twin Cities communities.",
    category: "language_access",
    priority: "high",
    status: "on_track",
    owner: "Disability Hub MN",
    startDate: "Nov 2024",
    targetDate: "Mar 2025",
    progressPercent: 72,
    keyResults: [
      { description: "Trained Somali trusted messengers", target: 20, current: 15, unit: "messengers", status: "on_track" },
      { description: "Somali-language materials distributed", target: 2000, current: 1400, unit: "pieces", status: "on_track" },
      { description: "Community events held", target: 8, current: 6, unit: "events", status: "on_track" }
    ],
    relatedCommunities: ["Somali/East African"],
    equityImpact: "Addresses language access gap — Somali fulfillment rate currently 90%, below 95% target",
    tags: ["language-access", "somali", "outreach"]
  },
  {
    id: "g3",
    title: "Complete DSP workforce equity training rollout",
    description: "Roll out cultural responsiveness and disability justice training to all DSPs working under DD and CADI waivers. Priority on providers serving BIPOC communities.",
    category: "workforce_development",
    priority: "high",
    status: "at_risk",
    owner: "DSD Training Team",
    startDate: "Oct 2024",
    targetDate: "Apr 2025",
    progressPercent: 48,
    keyResults: [
      { description: "DSPs completing disability justice module", target: 4500, current: 2160, unit: "DSPs", status: "at_risk" },
      { description: "Providers completing cultural responsiveness training", target: 200, current: 98, unit: "providers", status: "at_risk" },
      { description: "Training satisfaction score", target: 4.5, current: 4.7, unit: "/ 5.0", status: "on_track" }
    ],
    equityImpact: "Builds workforce capacity to serve BIPOC communities — addresses DSP cultural competency gap",
    tags: ["training", "workforce", "dsp"]
  },
  {
    id: "g4",
    title: "Publish disaggregated Q4 employment outcome data",
    description: "Generate and publish disaggregated competitive integrated employment outcomes by race, ethnicity, county, and waiver type. Include equity analysis and recommendations.",
    category: "data_transparency",
    priority: "high",
    status: "on_track",
    owner: "DSD Data Team",
    startDate: "Jan 2025",
    targetDate: "Feb 2025",
    progressPercent: 89,
    keyResults: [
      { description: "Data tables prepared by race/ethnicity", target: 12, current: 12, unit: "tables", status: "completed" },
      { description: "Equity analysis narrative drafted", target: 1, current: 1, unit: "document", status: "completed" },
      { description: "Leadership review completed", target: 1, current: 0, unit: "review", status: "in_progress" }
    ],
    equityImpact: "Transparency drives accountability — public disaggregated data creates pressure for disparity reduction",
    tags: ["data", "transparency", "employment"]
  },
  {
    id: "g5",
    title: "Establish Indigenous disability services advisory panel",
    description: "Create a standing advisory panel of Indigenous people with disabilities and family members to advise DSD on policy and program changes affecting Native communities.",
    category: "community_voice",
    priority: "high",
    status: "in_progress",
    owner: "DSD Equity Team",
    startDate: "Feb 2025",
    targetDate: "May 2025",
    progressPercent: 28,
    keyResults: [
      { description: "Advisory panel members recruited", target: 12, current: 5, unit: "members", status: "in_progress" },
      { description: "Charter and compensation structure established", target: 1, current: 0, unit: "document", status: "not_started" },
      { description: "First advisory meeting held", target: 1, current: 0, unit: "meeting", status: "not_started" }
    ],
    relatedCommunities: ["American Indian/Alaska Native"],
    equityImpact: "Nothing about us without us — centers Indigenous voices in DSD policy that affects Native communities",
    tags: ["community-voice", "indigenous", "advisory"]
  },
  {
    id: "g6",
    title: "DWRS 2026 equity impact analysis complete",
    description: "Analyze proposed DWRS 2026 rate changes for equity impacts on BIPOC-owned providers, rural providers, and DSP wage equity across community types.",
    category: "policy_change",
    priority: "critical",
    status: "in_progress",
    owner: "DSD Rate Team",
    startDate: "Jan 2025",
    targetDate: "Mar 2025",
    progressPercent: 55,
    keyResults: [
      { description: "Provider equity analysis complete", target: 1, current: 1, unit: "analysis", status: "completed" },
      { description: "Geographic equity analysis complete", target: 1, current: 0, unit: "analysis", status: "in_progress" },
      { description: "DSP wage equity report complete", target: 1, current: 0, unit: "report", status: "in_progress" },
      { description: "Recommendations to leadership", target: 1, current: 0, unit: "brief", status: "not_started" }
    ],
    equityImpact: "Rate changes can harm BIPOC-owned providers and rural communities — equity analysis ensures no unintended harm",
    tags: ["dwrs", "rates", "policy"]
  },
  {
    id: "g7",
    title: "Expand Oromo language access to 95% fulfillment",
    description: "Address critical gap in Oromo language interpretation and translation services. Currently at 79.7% fulfillment — below DHS Title VI obligation.",
    category: "language_access",
    priority: "critical",
    status: "in_progress",
    owner: "DSD Language Access Team",
    startDate: "Feb 2025",
    targetDate: "Jun 2025",
    progressPercent: 22,
    keyResults: [
      { description: "Qualified Oromo interpreters contracted", target: 8, current: 3, unit: "interpreters", status: "in_progress" },
      { description: "Oromo fulfillment rate", target: 95, current: 79.7, unit: "%", status: "in_progress" },
      { description: "Oromo-language materials created", target: 10, current: 2, unit: "materials", status: "in_progress" }
    ],
    relatedCommunities: ["Somali/East African"],
    equityImpact: "Oromo gap is a Title VI compliance issue — affects Ethiopian/Eritrean communities' access to services",
    tags: ["language-access", "oromo", "compliance"]
  },
  {
    id: "g8",
    title: "Employment First disparities reduction plan adopted",
    description: "Develop and get executive sign-off on a 3-year plan to close the 23-point Black/White employment gap for waiver participants.",
    category: "employment_first",
    priority: "critical",
    status: "not_started",
    owner: "DSD Employment First Team",
    startDate: "Mar 2025",
    targetDate: "Jun 2025",
    progressPercent: 0,
    keyResults: [
      { description: "Root cause analysis complete", target: 1, current: 0, unit: "analysis", status: "not_started" },
      { description: "Community input process held", target: 3, current: 0, unit: "sessions", status: "not_started" },
      { description: "3-year plan drafted and approved", target: 1, current: 0, unit: "plan", status: "not_started" }
    ],
    relatedCommunities: ["Black/African American", "Somali/East African"],
    equityImpact: "23-point employment gap is largest measurable equity failure in DSD — requires dedicated plan",
    tags: ["employment-first", "disparities", "planning"]
  }
];

const statusConfig: Record<GoalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700", icon: null },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: <span className="text-xs">{"↑"}</span> },
  on_track: { label: "On Track", color: "bg-green-100 text-green-700", icon: <span className="text-xs">{"✓"}</span> },
  at_risk: { label: "At Risk", color: "bg-amber-100 text-amber-700", icon: <span className="text-xs">{"!"}</span> },
  completed: { label: "Completed", color: "bg-teal-100 text-teal-700", icon: <span className="text-xs">{"✓"}</span> },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-400", icon: null }
};

const priorityConfig: Record<GoalPriority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-600" }
};

const categoryLabels: Record<string, string> = {
  equity_access: "Equity Access",
  workforce_development: "Workforce",
  policy_change: "Policy",
  data_transparency: "Data",
  community_voice: "Community Voice",
  olmstead: "Olmstead",
  employment_first: "Employment First",
  language_access: "Language Access",
  provider_diversity: "Providers",
  training: "Training"
};

export default function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const filtered = goals.filter(g => {
    const matchesSearch = !searchQuery ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || g.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const critical = goals.filter(g => g.priority === "critical").length;
  const atRisk = goals.filter(g => g.status === "at_risk").length;
  const onTrack = goals.filter(g => g.status === "on_track").length;
  const completed = goals.filter(g => g.status === "completed").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="goals.title" defaultValue="Operational Goals" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="goals.subtitle" defaultValue={`${goals.length} goals · ${critical} critical · Equity-aligned OKRs`} />
          </p>
        </div>
        <Button className="gap-2">
          <span>+</span>
          Add Goal
        </Button>
      </div>

      <PageToolbar title="Operational Goals" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{goals.length}</div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{onTrack}</div>
            <div className="text-sm text-muted-foreground">On Track</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{atRisk}</div>
            <div className="text-sm text-muted-foreground">At Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{critical}</div>
            <div className="text-sm text-muted-foreground">Critical Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {filtered.map(goal => (
          <Card key={goal.id} className={`${expandedGoal === goal.id ? "ring-2 ring-[#003865]" : "hover:shadow-sm"} transition-all`}>
            <CardContent className="p-4">
              <div
                className="flex items-start gap-4 cursor-pointer"
                onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
              >
                {/* Left: progress ring */}
                <div className="flex-shrink-0 relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={goal.status === "at_risk" ? "#f59e0b" : goal.status === "completed" ? "#10b981" : "#003865"}
                      strokeWidth="3"
                      strokeDasharray={`${goal.progressPercent} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {goal.progressPercent}%
                  </span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold leading-snug flex-1">{goal.title}</h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[goal.priority].color}`}>
                        {priorityConfig[goal.priority].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusConfig[goal.status].color}`}>
                        {statusConfig[goal.status].icon}
                        {statusConfig[goal.status].label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{goal.description.slice(0, 120)}...</p>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {goal.owner}
                    </span>
                    <span className="flex items-center gap-1">
                      Due: {goal.targetDate}
                    </span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      {categoryLabels[goal.category]}
                    </span>
                  </div>

                  <Progress value={goal.progressPercent} className="h-1.5 mt-2" />
                </div>

                <span className={`text-muted-foreground flex-shrink-0 transition-transform ${expandedGoal === goal.id ? "rotate-90" : ""}`}>{">"}</span>
              </div>

              {/* Expanded view */}
              {expandedGoal === goal.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Equity impact */}
                  {goal.equityImpact && (
                    <div className="bg-[#003865]/5 rounded-lg p-3">
                      <p className="text-xs font-medium text-[#003865] mb-1">Equity Impact</p>
                      <p className="text-xs text-foreground">{goal.equityImpact}</p>
                    </div>
                  )}

                  {/* Key Results */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Results</p>
                    <div className="space-y-3">
                      {goal.keyResults.map((kr, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium flex-1">{kr.description}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {kr.current} / {kr.target} {kr.unit}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${statusConfig[kr.status].color}`}>
                                {statusConfig[kr.status].label}
                              </span>
                            </div>
                          </div>
                          <Progress
                            value={Math.min((kr.current / kr.target) * 100, 100)}
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related communities */}
                  {goal.relatedCommunities && goal.relatedCommunities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Related Communities</p>
                      <div className="flex flex-wrap gap-1">
                        {goal.relatedCommunities.map(c => (
                          <span key={c} className="text-xs bg-[#003865]/10 text-[#003865] px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">Edit Goal</Button>
                    <Button size="sm" variant="outline" className="text-xs">Update Progress</Button>
                    <Button size="sm" variant="outline" className="text-xs">View History</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No goals found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
