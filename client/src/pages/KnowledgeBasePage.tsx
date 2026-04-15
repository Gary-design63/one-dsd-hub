import React, { useState } from "react";
import { EditableText } from "@/components/EditableText";
import { PageToolbar } from "@/components/PageToolbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KBDocument {
  id: string;
  title: string;
  category: string;
  authorityLevel: "federal" | "state" | "agency" | "division" | "operational";
  description: string;
  lastUpdated: string;
  status: "current" | "under_review" | "archived";
  tags: string[];
  source: string;
}

const AUTHORITY_COLORS: Record<string, string> = {
  federal: "bg-red-100 text-red-700",
  state: "bg-purple-100 text-purple-700",
  agency: "bg-blue-100 text-blue-700",
  division: "bg-teal-100 text-teal-700",
  operational: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS: Record<string, string> = {
  current: "bg-green-100 text-green-700",
  under_review: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

const documents: KBDocument[] = [
  {
    id: "kb1",
    title: "Americans with Disabilities Act (ADA)",
    category: "Governing Documents",
    authorityLevel: "federal",
    description: "Federal civil rights law prohibiting discrimination against individuals with disabilities. Title II applies to state and local government services including DHS programs.",
    lastUpdated: "Apr 24, 2024",
    status: "current",
    tags: ["civil-rights", "ada", "title-ii", "compliance"],
    source: "U.S. Department of Justice"
  },
  {
    id: "kb2",
    title: "Section 504 of the Rehabilitation Act",
    category: "Governing Documents",
    authorityLevel: "federal",
    description: "Prohibits discrimination on the basis of disability in programs receiving federal financial assistance. Foundation for all DHS disability service obligations.",
    lastUpdated: "Jan 10, 2025",
    status: "current",
    tags: ["section-504", "rehabilitation-act", "civil-rights"],
    source: "U.S. Department of Health and Human Services"
  },
  {
    id: "kb3",
    title: "HCBS Settings Final Rule (CMS-2249-F/CMS-2296-F)",
    category: "Governing Documents",
    authorityLevel: "federal",
    description: "CMS rule requiring all HCBS settings to meet person-centered and community integration standards. Full compliance deadline extended to March 2027.",
    lastUpdated: "Mar 17, 2025",
    status: "current",
    tags: ["hcbs", "settings-rule", "cms", "compliance"],
    source: "Centers for Medicare & Medicaid Services"
  },
  {
    id: "kb4",
    title: "Minnesota Olmstead Plan",
    category: "Governing Documents",
    authorityLevel: "state",
    description: "Minnesota's comprehensive plan for ensuring people with disabilities live, learn, work, and enjoy life in the most integrated setting. Updated annually with measurable goals.",
    lastUpdated: "Oct 1, 2024",
    status: "current",
    tags: ["olmstead", "community-integration", "state-plan"],
    source: "Olmstead Implementation Office"
  },
  {
    id: "kb5",
    title: "Minnesota Statutes Chapter 256B — Medical Assistance",
    category: "Governing Documents",
    authorityLevel: "state",
    description: "State statutory authority for Medical Assistance waiver programs including CADI, DD, BI, and CAC waivers administered by DSD.",
    lastUpdated: "Jul 1, 2024",
    status: "current",
    tags: ["statute", "medical-assistance", "waivers"],
    source: "Minnesota Legislature"
  },
  {
    id: "kb6",
    title: "DHS Equity Policy — EO 19-01 Implementation",
    category: "Equity Tools",
    authorityLevel: "agency",
    description: "Agency-wide equity policy implementing Governor's Executive Order 19-01 on diversity, inclusion, and equity in state government operations and services.",
    lastUpdated: "Feb 15, 2025",
    status: "current",
    tags: ["equity-policy", "executive-order", "dei"],
    source: "DHS Office of Equity and Inclusion"
  },
  {
    id: "kb7",
    title: "Racial Equity Impact Assessment Tool",
    category: "Equity Tools",
    authorityLevel: "agency",
    description: "Standardized tool for assessing racial equity impacts of proposed policies, programs, and budget decisions. Required for all major DHS initiatives.",
    lastUpdated: "Jan 20, 2025",
    status: "current",
    tags: ["reia", "racial-equity", "impact-assessment"],
    source: "DHS Office of Equity and Inclusion"
  },
  {
    id: "kb8",
    title: "CHOICE Framework Reference Guide",
    category: "Equity Tools",
    authorityLevel: "division",
    description: "DSD's six-domain framework for measuring equity in disability services: Community, Home, Occupation, Independence, Connections, Equity. Aligns all operations with person-centered outcomes.",
    lastUpdated: "Mar 1, 2025",
    status: "current",
    tags: ["choice", "framework", "outcomes", "equity"],
    source: "DSD Equity & Inclusion Operations"
  },
  {
    id: "kb9",
    title: "Sniff Check Protocol — Levels 1/2/3",
    category: "Equity Tools",
    authorityLevel: "division",
    description: "Three-tier quality assurance protocol ensuring all DSD outputs are reviewed for equity, accuracy, cultural responsiveness, and alignment with the Primary Directive.",
    lastUpdated: "Feb 28, 2025",
    status: "current",
    tags: ["sniff-check", "quality-assurance", "review-protocol"],
    source: "DSD Equity & Inclusion Operations"
  },
  {
    id: "kb10",
    title: "Logic Model — Equity Operations",
    category: "Program References",
    authorityLevel: "division",
    description: "DSD equity operations logic model mapping Inputs → Activities → Outputs → Outcomes → Impact. Anchors all agent and program work to measurable outcomes.",
    lastUpdated: "Mar 5, 2025",
    status: "current",
    tags: ["logic-model", "operations", "outcomes"],
    source: "DSD Equity & Inclusion Operations"
  },
  {
    id: "kb11",
    title: "DWRS Rate Methodology Guide",
    category: "Program References",
    authorityLevel: "state",
    description: "Technical guide to Minnesota's Disability Waiver Rate System methodology. Covers rate components, provider frameworks, and annual adjustment calculations.",
    lastUpdated: "Nov 15, 2024",
    status: "current",
    tags: ["dwrs", "rates", "methodology", "provider"],
    source: "DHS Rate Setting Division"
  },
  {
    id: "kb12",
    title: "Title VI Language Access Plan",
    category: "Program References",
    authorityLevel: "agency",
    description: "DHS plan for ensuring meaningful access to services for people with limited English proficiency. Covers interpretation, translation, and signage obligations.",
    lastUpdated: "Dec 1, 2024",
    status: "under_review",
    tags: ["title-vi", "language-access", "lep"],
    source: "DHS Civil Rights Office"
  },
  {
    id: "kb13",
    title: "DSP Workforce Data Report 2024",
    category: "Program References",
    authorityLevel: "division",
    description: "Annual report on Direct Support Professional workforce demographics, wages, turnover, and equity metrics across Minnesota counties and tribal nations.",
    lastUpdated: "Jan 30, 2025",
    status: "current",
    tags: ["dsp", "workforce", "data", "annual-report"],
    source: "DSD Research & Evaluation"
  },
  {
    id: "kb14",
    title: "Community Engagement Protocol",
    category: "Equity Tools",
    authorityLevel: "division",
    description: "Standard protocol for engaging with communities served by DSD. Covers outreach, relationship building, feedback collection, and closing the loop on community input.",
    lastUpdated: "Feb 10, 2025",
    status: "current",
    tags: ["community-engagement", "outreach", "protocol"],
    source: "DSD Equity & Inclusion Operations"
  },
  {
    id: "kb15",
    title: "Disability Hub MN Partnership MOU",
    category: "Program References",
    authorityLevel: "agency",
    description: "Memorandum of Understanding between DHS and Disability Hub MN for coordinated service navigation, information sharing, and community outreach.",
    lastUpdated: "Jul 1, 2024",
    status: "current",
    tags: ["disability-hub", "partnership", "mou"],
    source: "DHS Disability Services Division"
  },
];

const CATEGORIES = ["All", "Governing Documents", "Equity Tools", "Program References"];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = documents.filter(doc => {
    const matchesSearch = search === "" ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "All" || doc.category === category;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: documents.length,
    federal: documents.filter(d => d.authorityLevel === "federal").length,
    state: documents.filter(d => d.authorityLevel === "state").length,
    agency: documents.filter(d => d.authorityLevel === "agency").length,
    division: documents.filter(d => d.authorityLevel === "division").length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#003865]" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          <EditableText id="kb-title" defaultValue="Knowledge Base" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <EditableText id="kb-subtitle" defaultValue="Governing documents, equity tools, and program references organized by authority level" />
        </p>
      </div>

      <PageToolbar title="Knowledge Base" />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Documents", value: stats.total, color: "text-[#003865]" },
          { label: "Federal", value: stats.federal, color: "text-red-600" },
          { label: "State", value: stats.state, color: "text-purple-600" },
          { label: "Agency", value: stats.agency, color: "text-blue-600" },
          { label: "Division", value: stats.division, color: "text-teal-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search documents, tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
          aria-label="Search knowledge base"
        />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {CATEGORIES.map(c => (
            <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No documents match your search.</CardContent></Card>
            ) : (
              filtered.map(doc => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-[#003865] text-sm">{doc.title}</h3>
                          <Badge className={`text-[10px] ${AUTHORITY_COLORS[doc.authorityLevel]}`}>
                            {doc.authorityLevel}
                          </Badge>
                          <Badge className={`text-[10px] ${STATUS_COLORS[doc.status]}`}>
                            {doc.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{doc.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Source: {doc.source}</span>
                          <span>·</span>
                          <span>Updated {doc.lastUpdated}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" className="text-xs h-8">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
