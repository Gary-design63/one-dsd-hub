import React, { useMemo, useState } from "react";
import { Activity, Clock3, Play, RotateCcw, Sparkles } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface WorkflowStage {
  name: string;
  description: string;
  status: "complete" | "in_progress" | "pending";
}

interface Workflow {
  id: string;
  title: string;
  category: string;
  description: string;
  stages: WorkflowStage[];
  estimatedTime: string;
  owner: string;
  sniffCheckLevel: string;
  lastRun: string | null;
  activeRuns: number;
}

const workflows: Workflow[] = [
  {
    id: "wf1",
    title: "Equity Scan",
    category: "Equity Analysis",
    description: "Quick equity review of a document, policy, or communication. Checks for inclusive language, population representation, and alignment with DSD equity commitments.",
    stages: [
      { name: "Document Intake", description: "Upload or paste the document for review", status: "complete" },
      { name: "Language Review", description: "Check for inclusive, person-first language", status: "complete" },
      { name: "Population Check", description: "Verify all served populations are represented", status: "in_progress" },
      { name: "Equity Alignment", description: "Assess alignment with CHOICE framework", status: "pending" },
      { name: "Report Generation", description: "Produce scan results and recommendations", status: "pending" },
    ],
    estimatedTime: "15–30 min",
    owner: "Equity & Inclusion Consultant",
    sniffCheckLevel: "L1",
    lastRun: "Mar 18, 2025",
    activeRuns: 2,
  },
  {
    id: "wf2",
    title: "Full Equity Analysis",
    category: "Equity Analysis",
    description: "Comprehensive equity analysis of a program, policy, or initiative. Includes data analysis, community input review, disparity identification, and actionable recommendations.",
    stages: [
      { name: "Scope Definition", description: "Define analysis scope, populations, and data sources", status: "complete" },
      { name: "Data Collection", description: "Gather quantitative and qualitative data", status: "complete" },
      { name: "Disparity Analysis", description: "Identify disparities across populations", status: "complete" },
      { name: "Root Cause Review", description: "Analyze structural and systemic factors", status: "in_progress" },
      { name: "Community Input", description: "Incorporate lived experience and community feedback", status: "pending" },
      { name: "Recommendations", description: "Develop actionable equity recommendations", status: "pending" },
      { name: "Leadership Review", description: "L3 Sniff Check and leadership approval", status: "pending" },
    ],
    estimatedTime: "2–4 weeks",
    owner: "Equity & Inclusion Consultant",
    sniffCheckLevel: "L3",
    lastRun: "Feb 10, 2025",
    activeRuns: 1,
  },
  {
    id: "wf3",
    title: "Accessibility Review",
    category: "Compliance",
    description: "ADA Title II accessibility review for digital content, physical spaces, or program materials. Ensures compliance with WCAG 2.1 AA and state accessibility standards.",
    stages: [
      { name: "Content Identification", description: "Identify materials to review", status: "complete" },
      { name: "Automated Scan", description: "Run automated accessibility checks", status: "complete" },
      { name: "Manual Review", description: "Expert review of content and navigation", status: "in_progress" },
      { name: "Remediation Plan", description: "Document issues and remediation steps", status: "pending" },
      { name: "Verification", description: "Confirm fixes meet standards", status: "pending" },
    ],
    estimatedTime: "1–2 weeks",
    owner: "Accessibility Lead",
    sniffCheckLevel: "L2",
    lastRun: "Mar 5, 2025",
    activeRuns: 3,
  },
  {
    id: "wf4",
    title: "Community Engagement Process",
    category: "Community",
    description: "Structured process for engaging with communities served by DSD. Ensures authentic engagement, compensated participation, and closed-loop feedback.",
    stages: [
      { name: "Planning", description: "Identify community, set goals, allocate budget", status: "complete" },
      { name: "Relationship Building", description: "Connect with community leaders and organizations", status: "complete" },
      { name: "Engagement Session", description: "Conduct listening session or advisory meeting", status: "complete" },
      { name: "Documentation", description: "Record feedback with community consent", status: "in_progress" },
      { name: "Action Planning", description: "Develop response to community input", status: "pending" },
      { name: "Close the Loop", description: "Report back to community on actions taken", status: "pending" },
    ],
    estimatedTime: "4–8 weeks",
    owner: "Community Engagement Coordinator",
    sniffCheckLevel: "L2",
    lastRun: "Jan 25, 2025",
    activeRuns: 4,
  },
  {
    id: "wf5",
    title: "Policy Document Review",
    category: "Compliance",
    description: "Multi-stage review process for DSD policy documents. Ensures accuracy, equity alignment, plain language, and proper authority chain approval.",
    stages: [
      { name: "Draft Submission", description: "Author submits draft for review", status: "complete" },
      { name: "Equity Scan", description: "L1 equity and inclusion review", status: "complete" },
      { name: "Technical Review", description: "Subject matter expert validation", status: "in_progress" },
      { name: "Plain Language", description: "Readability and accessibility check", status: "pending" },
      { name: "Leadership Approval", description: "Division leadership sign-off", status: "pending" },
      { name: "Publication", description: "Publish and distribute to stakeholders", status: "pending" },
    ],
    estimatedTime: "1–3 weeks",
    owner: "Policy Team Lead",
    sniffCheckLevel: "L2",
    lastRun: "Mar 12, 2025",
    activeRuns: 5,
  },
  {
    id: "wf6",
    title: "Training Development",
    category: "Learning",
    description: "End-to-end workflow for developing equity-focused training modules. Includes needs assessment, content creation, community review, and deployment.",
    stages: [
      { name: "Needs Assessment", description: "Identify training gap and audience", status: "complete" },
      { name: "Content Design", description: "Develop learning objectives and outline", status: "complete" },
      { name: "Content Creation", description: "Build training materials and activities", status: "in_progress" },
      { name: "Community Review", description: "Review by people with lived experience", status: "pending" },
      { name: "Pilot Testing", description: "Test with small group and gather feedback", status: "pending" },
      { name: "Deployment", description: "Publish and assign to staff", status: "pending" },
    ],
    estimatedTime: "4–6 weeks",
    owner: "Training Design Agent",
    sniffCheckLevel: "L2",
    lastRun: "Feb 20, 2025",
    activeRuns: 2,
  },
  {
    id: "wf7",
    title: "DWRS Rate Equity Review",
    category: "Equity Analysis",
    description: "Annual equity review of Disability Waiver Rate System changes. Analyzes impact on BIPOC-owned providers, rural providers, and DSP wage equity.",
    stages: [
      { name: "Rate Change Intake", description: "Receive proposed rate adjustments", status: "complete" },
      { name: "Provider Impact Analysis", description: "Model impact by provider demographics", status: "complete" },
      { name: "Geographic Analysis", description: "Assess rural/urban/tribal impact", status: "complete" },
      { name: "DSP Wage Analysis", description: "Evaluate effect on DSP compensation", status: "complete" },
      { name: "Mitigation Recommendations", description: "Propose adjustments to reduce disparities", status: "in_progress" },
      { name: "Stakeholder Review", description: "Present findings to rate advisory group", status: "pending" },
    ],
    estimatedTime: "3–4 weeks",
    owner: "DWRS Rate Agent",
    sniffCheckLevel: "L3",
    lastRun: "Mar 15, 2025",
    activeRuns: 1,
  },
];

const CATEGORIES = ["All", "Equity Analysis", "Compliance", "Community", "Learning"];

function deriveProgress(stages: WorkflowStage[]) {
  const complete = stages.filter((stage) => stage.status === "complete").length;
  const inProgress = stages.filter((stage) => stage.status === "in_progress").length;
  return Math.round(((complete + inProgress * 0.5) / stages.length) * 100);
}

function advanceStage(workflow: Workflow): Workflow {
  const stages: WorkflowStage[] = workflow.stages.map((stage) => ({ ...stage }));
  const currentIndex = stages.findIndex((stage) => stage.status === "in_progress");

  if (currentIndex >= 0) {
    stages[currentIndex].status = "complete";
    if (currentIndex + 1 < stages.length) stages[currentIndex + 1].status = "in_progress";
  } else {
    const pendingIndex = stages.findIndex((stage) => stage.status === "pending");
    if (pendingIndex >= 0) stages[pendingIndex].status = "in_progress";
  }

  return {
    ...workflow,
    stages,
    activeRuns: workflow.activeRuns + 1,
    lastRun: "Just now",
  };
}

function resetWorkflow(workflow: Workflow): Workflow {
  return {
    ...workflow,
    stages: workflow.stages.map((stage, index) => ({
      ...stage,
      status: (index === 0 ? "in_progress" : "pending") as WorkflowStage["status"],
    })),
    activeRuns: Math.max(0, workflow.activeRuns - 1),
    lastRun: "Reset just now",
  };
}

const statusStyles: Record<WorkflowStage["status"], string> = {
  complete: "bg-emerald-500",
  in_progress: "bg-[hsl(var(--mn-blue))]",
  pending: "bg-slate-300 dark:bg-slate-700",
};

export default function WorkflowsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [workflowState, setWorkflowState] = useState(workflows);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0].id);

  const filtered = useMemo(
    () => (selectedCategory === "All" ? workflowState : workflowState.filter((workflow) => workflow.category === selectedCategory)),
    [selectedCategory, workflowState],
  );

  const selectedWorkflow = filtered.find((workflow) => workflow.id === selectedWorkflowId) ?? filtered[0] ?? workflowState[0];

  const totalActive = workflowState.reduce((sum, workflow) => sum + workflow.activeRuns, 0);
  const l3Count = workflowState.filter((workflow) => workflow.sniffCheckLevel === "L3").length;
  const averageProgress = Math.round(workflowState.reduce((sum, workflow) => sum + deriveProgress(workflow.stages), 0) / workflowState.length);

  const updateWorkflow = (id: string, updater: (workflow: Workflow) => Workflow) => {
    setWorkflowState((current) => current.map((workflow) => (workflow.id === id ? updater(workflow) : workflow)));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6 md:py-6">
      <section className="hero-panel rounded-[28px] border border-border/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--mn-blue))] dark:border-white/10 dark:bg-white/5 dark:text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Guided workflows
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground md:text-[1.65rem]">
                <EditableText id="wf-title" defaultValue="Workflows" />
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                <EditableText id="wf-subtitle" defaultValue="Guided processes for equity scans, analyses, accessibility reviews, and community engagement with instant stage controls." />
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Workflows", value: workflowState.length, icon: Activity },
              { label: "Active runs", value: totalActive, icon: Play },
              { label: "Avg progress", value: `${averageProgress}%`, icon: Clock3 },
              { label: "L3 reviews", value: l3Count, icon: Sparkles },
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

      <PageToolbar title="Workflows" />

      <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">Category focus</CardTitle>
              <CardDescription>Switch the workflow lane and instantly narrow the set on the right.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    const nextSet = category === "All" ? workflowState : workflowState.filter((workflow) => workflow.category === category);
                    if (nextSet[0]) setSelectedWorkflowId(nextSet[0].id);
                  }}
                  className={selectedCategory === category ? "chip-button chip-button-active w-full justify-center" : "chip-button w-full justify-center"}
                  data-testid={`button-workflow-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {category}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="panel-card">
            <CardHeader>
              <CardTitle className="text-base">Workflow queue</CardTitle>
              <CardDescription>Select a workflow to inspect its current stage state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  onClick={() => setSelectedWorkflowId(workflow.id)}
                  className={workflow.id === selectedWorkflowId ? "list-button list-button-active" : "list-button"}
                  data-testid={`button-workflow-select-${workflow.id}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{workflow.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{workflow.category}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{deriveProgress(workflow.stages)}%</div>
                    <div>{workflow.activeRuns} active</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedWorkflow ? (
            <Card className="panel-card" data-testid={`card-workflow-detail-${selectedWorkflow.id}`}>
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-0 bg-[hsl(var(--mn-blue-soft))] text-[hsl(var(--mn-blue))]">{selectedWorkflow.category}</Badge>
                      <Badge className="border-0 bg-slate-500/10 text-slate-700 dark:text-slate-300">Sniff Check {selectedWorkflow.sniffCheckLevel}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg font-semibold text-foreground">{selectedWorkflow.title}</CardTitle>
                    <CardDescription className="mt-2 max-w-3xl text-sm leading-6">{selectedWorkflow.description}</CardDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3 text-center sm:w-[280px]">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Active</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">{selectedWorkflow.activeRuns}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Progress</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums">{deriveProgress(selectedWorkflow.stages)}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl bg-[hsl(var(--mn-blue))] text-white hover:bg-[hsl(var(--mn-blue-deep))]"
                    onClick={() => updateWorkflow(selectedWorkflow.id, advanceStage)}
                    data-testid="button-workflow-advance"
                  >
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Advance stage
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => updateWorkflow(selectedWorkflow.id, resetWorkflow)}
                    data-testid="button-workflow-reset"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset run
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">Run completion</span>
                    <span className="text-muted-foreground tabular-nums">{deriveProgress(selectedWorkflow.stages)}%</span>
                  </div>
                  <Progress value={deriveProgress(selectedWorkflow.stages)} className="h-2.5" />
                </div>

                <div className="grid gap-3">
                  {selectedWorkflow.stages.map((stage, index) => (
                    <div key={`${selectedWorkflow.id}-${stage.name}`} className="rounded-2xl border border-border/60 bg-card p-4" data-testid={`workflow-stage-${selectedWorkflow.id}-${index}`}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-3 w-3 rounded-full ${statusStyles[stage.status]}`} />
                          <div>
                            <div className="text-sm font-semibold text-foreground">{stage.name}</div>
                            <div className="mt-1 text-sm leading-6 text-muted-foreground">{stage.description}</div>
                          </div>
                        </div>
                        <Badge className="w-fit border-0 bg-muted/80 text-xs capitalize text-muted-foreground">{stage.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Owner</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{selectedWorkflow.owner}</div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Estimated time</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{selectedWorkflow.estimatedTime}</div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Last run</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{selectedWorkflow.lastRun ?? "No runs yet"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="panel-card">
              <CardContent className="px-6 py-16 text-center text-muted-foreground">No workflows available for this category.</CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
