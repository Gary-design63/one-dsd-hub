import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DSD_RESOURCES } from "@/core/dsdResources";

const policyDocs = [
  {
    id: "pd1",
    title: "Olmstead Plan Progress Brief — Q4 2024",
    type: "policy_brief",
    status: "published",
    programArea: "Olmstead",
    summary: "Quarterly progress report on Minnesota's Olmstead Plan commitments. Shows 847 community transitions from nursing facilities, 2.3% improvement in community living rates, and persistent employment disparities requiring urgent action.",
    equityImpact: "High — directly measures community integration outcomes for all BIPOC communities",
    lastUpdated: "Jan 15, 2025",
    sniffCheckStatus: "PASS",
    sniffCheckLevel: "L2",
    audience: ["Leadership", "Legislature", "Public"],
    tags: ["olmstead", "quarterly", "community-integration"]
  },
  {
    id: "pd2",
    title: "DWRS 2026 Equity Impact Analysis",
    type: "equity_analysis",
    status: "review",
    programArea: "DWRS Rates",
    summary: "Analysis of how proposed 2026 Disability Waiver Rate System changes affect BIPOC-owned providers, rural providers, and DSP wage equity. Includes 3 scenarios and recommendations.",
    equityImpact: "Critical — rate changes could harm BIPOC-owned providers without mitigation",
    lastUpdated: "Feb 8, 2025",
    sniffCheckStatus: "WARNING",
    sniffCheckLevel: "L2",
    audience: ["Leadership", "Rate Team", "Providers"],
    tags: ["dwrs", "rates", "equity-analysis"]
  },
  {
    id: "pd3",
    title: "Language Access Plan 2025–2027",
    type: "policy_brief",
    status: "draft",
    programArea: "Language Access",
    summary: "Three-year plan to achieve 95%+ fulfillment rates across all Minnesota non-English languages in disability services. Prioritizes Oromo (79.7% gap) and Hmong expansion.",
    equityImpact: "High — language access is a Title VI civil rights obligation",
    lastUpdated: "Feb 20, 2025",
    sniffCheckStatus: "PASS",
    sniffCheckLevel: "L1",
    audience: ["Leadership", "County Partners", "Providers"],
    tags: ["language-access", "title-vi", "planning"]
  },
  {
    id: "pd4",
    title: "Employment First Racial Disparities — Root Cause Analysis",
    type: "data_report",
    status: "draft",
    programArea: "Employment First",
    summary: "Root cause analysis of the 23-point Black/White employment gap among waiver participants. Identifies 7 structural factors and proposes targeted interventions for each.",
    equityImpact: "Critical — addresses largest measurable equity failure in DSD",
    lastUpdated: "Mar 1, 2025",
    sniffCheckStatus: "REVIEW_REQUIRED",
    sniffCheckLevel: "L3",
    audience: ["Leadership", "Employment Team", "Legislature"],
    tags: ["employment-first", "racial-disparities", "root-cause"]
  },
  {
    id: "pd5",
    title: "HCBS Settings Rule Compliance Status Report",
    type: "report",
    status: "published",
    programArea: "HCBS Settings",
    summary: "Statewide compliance report for all DD and CADI waiver residential settings. 94% in full compliance, 6% with remediation plans in place. Equity analysis of violations by provider type.",
    equityImpact: "Medium — compliance ensures dignity and rights for all waiver participants",
    lastUpdated: "Dec 20, 2024",
    sniffCheckStatus: "PASS",
    sniffCheckLevel: "L2",
    audience: ["Providers", "County", "Leadership"],
    tags: ["hcbs", "compliance", "settings-rule"]
  },
  {
    id: "pd6",
    title: "Indigenous Community Disability Services Gap Analysis",
    type: "equity_analysis",
    status: "published",
    programArea: "Equity Access",
    summary: "Comprehensive gap analysis for American Indian/Alaska Native Minnesotans with disabilities. Documents 50% waiver access ratio, provider shortage on reservations, and cultural competency gaps.",
    equityImpact: "Critical — Indigenous community shows largest systemic disparities across all metrics",
    lastUpdated: "Jan 28, 2025",
    sniffCheckStatus: "PASS",
    sniffCheckLevel: "L3",
    audience: ["Leadership", "County", "Tribal Nations", "Legislature"],
    tags: ["indigenous", "gap-analysis", "equity"]
  },
  {
    id: "pd7",
    title: "FY2026 Equity Budget Request — Narrative",
    type: "executive_memo",
    status: "approved",
    programArea: "Budget",
    summary: "Executive narrative supporting DSD FY2026 equity budget requests totaling $8.4M. Covers BIPOC outreach staffing, language access expansion, DSP wage equity pilots, and data infrastructure.",
    equityImpact: "High — secures resources for all equity priorities",
    lastUpdated: "Nov 15, 2024",
    sniffCheckStatus: "PASS",
    sniffCheckLevel: "L2",
    audience: ["Legislature", "DHS Leadership", "Budget Office"],
    tags: ["budget", "fy2026", "resource-request"]
  }
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-amber-100 text-amber-700", icon: null },
  review: { label: "In Review", color: "bg-blue-100 text-blue-700", icon: null },
  published: { label: "Published", color: "bg-green-100 text-green-700", icon: <span className="text-xs">{"✓"}</span> },
  approved: { label: "Approved", color: "bg-teal-100 text-teal-700", icon: <span className="text-xs">{"✓"}</span> },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-600", icon: null }
};

const sniffStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PASS: { label: "Sniff: Pass", color: "text-green-600", icon: <span className="text-xs">{"✓"}</span> },
  WARNING: { label: "Sniff: Warning", color: "text-amber-600", icon: <span className="text-xs">{"!"}</span> },
  FAIL: { label: "Sniff: Fail", color: "text-red-600", icon: <span className="text-xs">{"!"}</span> },
  REVIEW_REQUIRED: { label: "Sniff: L3 Required", color: "text-purple-600", icon: null }
};

const typeLabels: Record<string, string> = {
  policy_brief: "Policy Brief",
  equity_analysis: "Equity Analysis",
  data_report: "Data Report",
  executive_memo: "Executive Memo",
  guidance_document: "Guidance",
  report: "Report",
  legislative_testimony: "Testimony",
  community_report: "Community Report"
};

export default function PolicyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("documents");

  const filtered = policyDocs.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.programArea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            <EditableText id="policy.title" defaultValue="Policy Documents" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <EditableText id="policy.subtitle" defaultValue="Equity-aligned policy library · Sniff Check verified · Draft-ready outputs" />
          </p>
        </div>
        <Button className="gap-2">
          <span>+</span>
          New Document
        </Button>
      </div>

      <PageToolbar title="Policy Documents" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#003865]">{policyDocs.filter(d => d.status === "published" || d.status === "approved").length}</div>
            <div className="text-sm text-muted-foreground">Published Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{policyDocs.filter(d => d.status === "draft" || d.status === "review").length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{policyDocs.filter(d => d.sniffCheckStatus === "PASS").length}</div>
            <div className="text-sm text-muted-foreground">Sniff Check Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{policyDocs.filter(d => d.sniffCheckStatus === "REVIEW_REQUIRED").length}</div>
            <div className="text-sm text-muted-foreground">L3 Review Required</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="resources">DSD Resource Library</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search documents..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents list */}
          <div className="space-y-3">
            {filtered.map(doc => (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#003865]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#003865] font-semibold text-sm">DOC</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-semibold leading-snug flex-1">{doc.title}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${statusConfig[doc.status]?.color}`}>
                            {statusConfig[doc.status]?.icon}
                            {statusConfig[doc.status]?.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {typeLabels[doc.type] || doc.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{doc.programArea}</span>
                        <span className={`text-xs flex items-center gap-1 font-medium ${sniffStatusConfig[doc.sniffCheckStatus]?.color}`}>
                          {sniffStatusConfig[doc.sniffCheckStatus]?.icon}
                          {sniffStatusConfig[doc.sniffCheckStatus]?.label} ({doc.sniffCheckLevel})
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {doc.summary}
                      </p>

                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs text-muted-foreground">Equity Impact:</span>
                        <span className="text-xs font-medium">{doc.equityImpact}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          Updated {doc.lastUpdated}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            Download
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Authoritative DSD resource library — current program descriptions, statutes, and policy references.
          </p>

          {/* Waiver Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Minnesota Waiver Programs</CardTitle>
              <CardDescription>CADI, DD, BI, EW, AC — program descriptions and key information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(DSD_RESOURCES.waivers).map(([key, waiver]) => (
                  <div key={key} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{key}</span>
                      <Badge className="bg-[#003865]/10 text-[#003865] border-0 text-xs">{waiver.federalAuthority.split(" ")[0]}</Badge>
                    </div>
                    <p className="text-xs font-medium">{waiver.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{waiver.targetPopulation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">MN Statute: {waiver.minnesotaStatute}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Olmstead */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Olmstead Plan</CardTitle>
              <CardDescription>{DSD_RESOURCES.olmstead.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{DSD_RESOURCES.olmstead.mandate}</p>
              <div className="space-y-1">
                {DSD_RESOURCES.olmstead.keyCommitments.map((c, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-[#78BE21] mt-0.5">•</span>
                    {c}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Employment First */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment First Policy</CardTitle>
              <CardDescription>MN Statute 268A.15 · Community integrated employment is the presumed outcome</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {DSD_RESOURCES.employmentFirst.keyPrinciples.map((p, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-[#78BE21] mt-0.5">•</span>
                    {p}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disability Hub MN */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disability Hub MN</CardTitle>
              <CardDescription>{DSD_RESOURCES.disabilityHub.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <a href={DSD_RESOURCES.disabilityHub.url} className="text-[#003865] hover:underline" target="_blank" rel="noopener noreferrer">
                    {DSD_RESOURCES.disabilityHub.url}
                  </a>
                </span>
                <span className="text-muted-foreground">{DSD_RESOURCES.disabilityHub.phone}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {DSD_RESOURCES.disabilityHub.languages.map(lang => (
                  <span key={lang} className="text-xs bg-[#78BE21]/10 text-[#1e6b3e] px-2 py-0.5 rounded">
                    {lang}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
