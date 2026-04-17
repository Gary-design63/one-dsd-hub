import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  format: string;
  lastUpdated: string;
  usageCount: number;
  workflow: string | null;
  fields: string[];
}

const FORMAT_COLORS: Record<string, string> = {
  "Form": "bg-blue-100 text-blue-700",
  "Worksheet": "bg-purple-100 text-purple-700",
  "Checklist": "bg-green-100 text-green-700",
  "Report": "bg-amber-100 text-amber-700",
  "Memo": "bg-teal-100 text-teal-700",
  "Guide": "bg-rose-100 text-rose-700",
};

const templates: Template[] = [
  {
    id: "t1",
    title: "Equity Scan Worksheet",
    category: "Equity Analysis",
    description: "Standard worksheet for conducting a quick equity scan of documents, communications, or policies. Covers language, representation, and CHOICE alignment.",
    format: "Worksheet",
    lastUpdated: "Mar 10, 2025",
    usageCount: 47,
    workflow: "Equity Scan",
    fields: ["Document Title", "Author", "Target Audience", "Language Review", "Population Checklist", "CHOICE Domain Alignment", "Recommendations"],
  },
  {
    id: "t2",
    title: "Full Equity Analysis Report Template",
    category: "Equity Analysis",
    description: "Comprehensive report template for full equity analyses. Includes sections for data, findings, disparities, root causes, and recommendations.",
    format: "Report",
    lastUpdated: "Feb 15, 2025",
    usageCount: 12,
    workflow: "Full Equity Analysis",
    fields: ["Executive Summary", "Scope", "Data Sources", "Quantitative Findings", "Qualitative Findings", "Disparity Analysis", "Root Causes", "Recommendations", "Implementation Timeline"],
  },
  {
    id: "t3",
    title: "Community Engagement Planning Form",
    category: "Community Engagement",
    description: "Planning form for community engagement sessions. Covers logistics, budget, accessibility accommodations, and engagement goals.",
    format: "Form",
    lastUpdated: "Jan 20, 2025",
    usageCount: 23,
    workflow: "Community Engagement Process",
    fields: ["Community", "Date/Location", "Engagement Goals", "Key Contacts", "Budget", "Accessibility Plan", "Materials Needed", "Follow-up Plan"],
  },
  {
    id: "t4",
    title: "Community Feedback Summary",
    category: "Community Engagement",
    description: "Template for documenting and summarizing community feedback from engagement sessions, with consent tracking and action item assignment.",
    format: "Report",
    lastUpdated: "Feb 5, 2025",
    usageCount: 18,
    workflow: "Community Engagement Process",
    fields: ["Session Date", "Community", "Participants", "Key Themes", "Direct Quotes (consented)", "Action Items", "Close-the-Loop Plan"],
  },
  {
    id: "t5",
    title: "Accessibility Review Checklist",
    category: "Compliance",
    description: "WCAG 2.1 AA compliance checklist for digital content. Covers perceivable, operable, understandable, and robust criteria.",
    format: "Checklist",
    lastUpdated: "Mar 1, 2025",
    usageCount: 31,
    workflow: "Accessibility Review",
    fields: ["Content URL/Name", "Perceivable", "Operable", "Understandable", "Robust", "Remediation Notes", "Reviewer", "Pass/Fail"],
  },
  {
    id: "t6",
    title: "Sniff Check Form — Level 1",
    category: "Quality Assurance",
    description: "Quick quality check form for routine outputs. Covers accuracy, inclusive language, and basic equity alignment.",
    format: "Form",
    lastUpdated: "Feb 28, 2025",
    usageCount: 156,
    workflow: null,
    fields: ["Document/Output", "Agent Source", "Accuracy Check", "Language Check", "Equity Alignment", "Pass/Fail", "Notes"],
  },
  {
    id: "t7",
    title: "Sniff Check Form — Level 2",
    category: "Quality Assurance",
    description: "Detailed review form for outputs with equity implications. Adds population impact, data validation, and cultural responsiveness checks.",
    format: "Form",
    lastUpdated: "Feb 28, 2025",
    usageCount: 89,
    workflow: null,
    fields: ["Document/Output", "Agent Source", "Accuracy", "Language", "Population Impact", "Data Validation", "Cultural Responsiveness", "CHOICE Alignment", "Pass/Fail/Review"],
  },
  {
    id: "t8",
    title: "Sniff Check Form — Level 3",
    category: "Quality Assurance",
    description: "Executive-level review form for high-impact outputs. Requires leadership approval, community validation, and comprehensive equity assessment.",
    format: "Form",
    lastUpdated: "Feb 28, 2025",
    usageCount: 34,
    workflow: null,
    fields: ["Document/Output", "Full L2 Results", "Leadership Review", "Community Validation", "Legal/Compliance Check", "Final Determination", "Approver Signature"],
  },
  {
    id: "t9",
    title: "Training Needs Assessment",
    category: "Training",
    description: "Worksheet for identifying training gaps, audience analysis, and learning objective development for new equity training modules.",
    format: "Worksheet",
    lastUpdated: "Jan 15, 2025",
    usageCount: 8,
    workflow: "Training Development",
    fields: ["Training Topic", "Gap Analysis", "Target Audience", "Prerequisites", "Learning Objectives", "Delivery Method", "Assessment Plan"],
  },
  {
    id: "t10",
    title: "DWRS Rate Impact Memo",
    category: "Equity Analysis",
    description: "Standard memo format for communicating rate change impacts to leadership. Includes equity metrics, provider impact data, and mitigation recommendations.",
    format: "Memo",
    lastUpdated: "Mar 15, 2025",
    usageCount: 6,
    workflow: "DWRS Rate Equity Review",
    fields: ["Rate Change Summary", "Affected Populations", "Provider Demographics", "Geographic Impact", "DSP Wage Effect", "Equity Score", "Mitigation Options", "Recommendation"],
  },
  {
    id: "t11",
    title: "Policy Document Review Guide",
    category: "Compliance",
    description: "Step-by-step guide for reviewing DSD policy documents. Covers content accuracy, equity alignment, plain language, and approval workflow.",
    format: "Guide",
    lastUpdated: "Feb 20, 2025",
    usageCount: 22,
    workflow: "Policy Document Review",
    fields: ["Document Title", "Review Stage", "Content Checklist", "Equity Checklist", "Plain Language Score", "Reviewer Notes", "Approval Status"],
  },
  {
    id: "t12",
    title: "Logic Model Update Form",
    category: "Operations",
    description: "Form for proposing updates to the DSD equity operations logic model. Tracks changes to inputs, activities, outputs, outcomes, and impact statements.",
    format: "Form",
    lastUpdated: "Mar 5, 2025",
    usageCount: 4,
    workflow: null,
    fields: ["Component (Input/Activity/Output/Outcome/Impact)", "Current Language", "Proposed Change", "Justification", "Data Support", "Approver"],
  },
];

const CATEGORIES = ["All", "Equity Analysis", "Community Engagement", "Compliance", "Quality Assurance", "Training", "Operations"];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = templates.filter(t => {
    const matchesSearch = search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#003865]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          <EditableText id="tpl-title" defaultValue="Templates" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <EditableText id="tpl-subtitle" defaultValue="Operational forms and worksheets for all equity program workflows" />
        </p>
      </div>

      <PageToolbar title="Templates" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Templates", value: templates.length, color: "text-[#003865]" },
          { label: "Total Uses", value: totalUsage, color: "text-blue-600" },
          { label: "Categories", value: CATEGORIES.length - 1, color: "text-teal-600" },
          { label: "Linked to Workflows", value: templates.filter(t => t.workflow).length, color: "text-purple-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search templates..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-md"
        aria-label="Search templates"
      />

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(c => (
            <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No templates match your search.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map(tpl => (
                  <Card key={tpl.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm text-[#003865]">{tpl.title}</CardTitle>
                        <Badge className={`text-[10px] shrink-0 ${FORMAT_COLORS[tpl.format] || "bg-gray-100 text-gray-600"}`}>
                          {tpl.format}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                      {/* Fields preview */}
                      <div className="flex flex-wrap gap-1">
                        {tpl.fields.slice(0, 5).map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 bg-muted rounded text-muted-foreground">{f}</span>
                        ))}
                        {tpl.fields.length > 5 && (
                          <span className="text-[10px] px-2 py-0.5 text-muted-foreground">+{tpl.fields.length - 5} more</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Used {tpl.usageCount} times</span>
                          <span>·</span>
                          <span>Updated {tpl.lastUpdated}</span>
                        </div>
                        {tpl.workflow && (
                          <div className="text-xs text-muted-foreground">
                            Workflow: <span className="text-[#003865] font-medium">{tpl.workflow}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" className="text-xs h-8 bg-[#003865] hover:bg-[#002a4a] text-white">Use Template</Button>
                          <Button size="sm" variant="outline" className="text-xs h-8">Preview</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
