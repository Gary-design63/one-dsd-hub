import React, { useState, useEffect } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  id: string;
  phase: "foundation" | "application" | "leadership";
  label: string;
  description: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Foundation Phase
  { id: "f1", phase: "foundation", label: "Complete Disability Justice Foundations course", description: "90-minute online course covering disability justice framework and historical context." },
  { id: "f2", phase: "foundation", label: "Complete Language Justice and Accessible Communication course", description: "75-minute course on plain language, language access, and accessible materials." },
  { id: "f3", phase: "foundation", label: "Complete Minnesota Waiver Programs overview", description: "150-minute self-paced course covering CADI, DD, BI, EW, and AC programs." },
  { id: "f4", phase: "foundation", label: "Review all 30 community cultural profiles", description: "Read community profiles for all communities served by DSD." },
  // Application Phase
  { id: "a1", phase: "application", label: "Run at least one equity analysis using the platform", description: "Use the Analysis Workspace to complete a full or scan equity analysis." },
  { id: "a2", phase: "application", label: "Complete Employment First course", description: "180-minute hybrid course on Employment First policy and practice." },
  { id: "a3", phase: "application", label: "Submit one document through DHS formatter", description: "Use the policy page to ingest and format a document to DHS writing standards." },
  // Leadership Phase
  { id: "l1", phase: "leadership", label: "Complete Data Literacy for Equity Work course", description: "90-minute course on disaggregated data, disparity analysis, and equity storytelling." },
  { id: "l2", phase: "leadership", label: "Complete Community-Led Co-Design Facilitation course", description: "240-minute in-person course on facilitation, power dynamics, and accountability." },
  { id: "l3", phase: "leadership", label: "Demonstrate Logic Model application in one deliverable", description: "Produce a deliverable that maps to the Logic Model (Inputs through Impact)." },
];

const STORAGE_KEY = "onedsd-checklist-v3";

const phaseLabels: Record<string, { label: string; color: string }> = {
  foundation: { label: "Foundation", color: "bg-[#003865] text-white" },
  application: { label: "Application", color: "bg-[#78BE21] text-white" },
  leadership: { label: "Leadership", color: "bg-[#FFB71B] text-[#003865]" },
};

export default function CompletionChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const phases = ["foundation", "application", "leadership"] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <EditableText id="checklist.title" defaultValue="Completion Checklist" />
        </h1>
        <p className="text-muted-foreground mt-1">
          <EditableText id="checklist.subtitle" defaultValue="Track your progress through the One DSD Equity Platform learning journey." />
        </p>
      </div>

      <PageToolbar title="Completion Checklist" />

      {/* Progress summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-[#003865]">{completedCount} / {totalCount} completed ({progressPercent}%)</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Phases */}
      {phases.map(phase => {
        const items = CHECKLIST_ITEMS.filter(i => i.phase === phase);
        const phaseCompleted = items.filter(i => checked[i.id]).length;
        const cfg = phaseLabels[phase];

        return (
          <Card key={phase}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.color}`}>
                  {cfg.label}
                </span>
                <CardTitle className="text-base">{cfg.label} Phase</CardTitle>
                <span className="ml-auto text-xs text-muted-foreground">{phaseCompleted}/{items.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggle(item.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#003865] focus:ring-[#003865]"
                  />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${checked[item.id] ? "line-through text-muted-foreground" : ""}`}>
                      {item.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
