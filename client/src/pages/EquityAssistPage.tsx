import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { callAIStream } from "@/core/aiProvider";
import { runL1Check } from "@/core/SniffCheckEngine";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
interface KBDocument {
  id: string;
  title: string;
  category: string;
  authorityLevel: string;
  description: string;
  tags: string[];
  source: string;
}
interface ResearchAgent {
  id: string;
  name: string;
  domain: string;
  icon: string;
}
interface ResearchTemplate {
  icon: string;
  label: string;
  tier: string;
  prompt: string;
  agents: string[];
  kbDocs: string[];
}
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
interface SniffResult {
  status: string;
  flags: string[];
}

/* ------------------------------------------------------------------ */
/*  KNOWLEDGE BASE                                                     */
/* ------------------------------------------------------------------ */
const KB_DOCUMENTS: KBDocument[] = [
  { id: "eo-14091", title: "Executive Order 14091 \u2014 Advancing Racial Equity", category: "Governing", authorityLevel: "federal", description: "Federal mandate requiring equity assessments across all government programs and services.", tags: ["federal mandate", "racial equity", "DEIA"], source: "whitehouse.gov" },
  { id: "eo-13985", title: "Executive Order 13985 \u2014 Equity Action Plans", category: "Governing", authorityLevel: "federal", description: "Directs agencies to assess and remove barriers to equitable access in federal programs.", tags: ["equity action plans", "systemic barriers"], source: "whitehouse.gov" },
  { id: "ada-1990", title: "Americans with Disabilities Act (ADA)", category: "Governing", authorityLevel: "federal", description: "Prohibits discrimination against individuals with disabilities in all areas of public life.", tags: ["disability rights", "accessibility", "civil rights"], source: "ada.gov" },
  { id: "section-504", title: "Section 504 \u2014 Rehabilitation Act", category: "Governing", authorityLevel: "federal", description: "Prohibits discrimination based on disability in programs receiving federal financial assistance.", tags: ["disability", "rehabilitation", "federal funding"], source: "hhs.gov" },
  { id: "olmstead", title: "Olmstead v. L.C. Decision", category: "Governing", authorityLevel: "federal", description: "Supreme Court ruling requiring states to provide community-based services for people with disabilities.", tags: ["community integration", "institutional reform"], source: "ada.gov" },
  { id: "mn-disability-plan", title: "Minnesota Disability Equity Action Plan", category: "Equity Tools", authorityLevel: "state", description: "State-level strategic plan aligning disability services with equity goals and outcomes.", tags: ["strategic plan", "Minnesota", "disability services"], source: "mn.gov/dhs" },
  { id: "mn-olmstead-plan", title: "Minnesota Olmstead Plan", category: "Governing", authorityLevel: "state", description: "Minnesota implementation plan for community integration of people with disabilities.", tags: ["Olmstead", "community integration", "Minnesota"], source: "mn.gov/olmstead" },
  { id: "dsd-equity-framework", title: "DSD Equity Framework", category: "Equity Tools", authorityLevel: "division", description: "Division-level framework for embedding equity in disability service design and delivery.", tags: ["framework", "equity lens", "service design"], source: "internal" },
  { id: "equity-lens-tool", title: "Equity Lens Assessment Tool", category: "Equity Tools", authorityLevel: "division", description: "Structured tool for evaluating policies and programs through an equity perspective.", tags: ["assessment", "equity lens", "evaluation"], source: "internal" },
  { id: "disparity-data-2024", title: "Disability Services Disparity Data 2024", category: "Data & Research", authorityLevel: "agency", description: "Current data on disparities in access, outcomes, and satisfaction across disability services.", tags: ["data", "disparities", "outcomes"], source: "mn.gov/dhs" },
  { id: "community-engagement", title: "Community Engagement Standards", category: "Equity Tools", authorityLevel: "division", description: "Standards for meaningful engagement with disability communities in policy development.", tags: ["community engagement", "lived experience", "participation"], source: "internal" },
  { id: "cultural-responsiveness", title: "Cultural Responsiveness Guidelines", category: "Equity Tools", authorityLevel: "division", description: "Guidelines for culturally responsive service delivery in disability programs.", tags: ["cultural competency", "responsive services"], source: "internal" },
  { id: "intersectionality-brief", title: "Intersectionality in Disability Services", category: "Data & Research", authorityLevel: "agency", description: "Research brief on how intersecting identities affect disability service access and outcomes.", tags: ["intersectionality", "research", "identity"], source: "mn.gov/dhs" },
  { id: "waiver-equity-analysis", title: "Waiver Program Equity Analysis", category: "Data & Research", authorityLevel: "agency", description: "Analysis of equity metrics across HCBS waiver programs including access and utilization.", tags: ["HCBS", "waiver", "equity analysis"], source: "mn.gov/dhs" },
  { id: "plain-language-guide", title: "Plain Language & Accessibility Guide", category: "Equity Tools", authorityLevel: "operational", description: "Guide for creating accessible, plain-language communications for diverse audiences.", tags: ["plain language", "accessibility", "communications"], source: "internal" },
];

const KB_CATEGORIES = ["All", "Governing", "Equity Tools", "Data & Research"];

const AUTHORITY_COLORS: Record<string, string> = {
  federal: "bg-blue-100 text-blue-800",
  state: "bg-purple-100 text-purple-800",
  agency: "bg-green-100 text-green-800",
  division: "bg-amber-100 text-amber-800",
  operational: "bg-gray-100 text-gray-800",
};

/* ------------------------------------------------------------------ */
/*  RESEARCH AGENTS                                                    */
/* ------------------------------------------------------------------ */
const RESEARCH_AGENTS: ResearchAgent[] = [
  { id: "policy", name: "Policy Analyst", domain: "Federal & state disability policy", icon: "" },
  { id: "equity", name: "Equity Specialist", domain: "Equity frameworks & assessment", icon: "" },
  { id: "legal", name: "Legal Analyst", domain: "ADA, Section 504, Olmstead compliance", icon: "" },
  { id: "data", name: "Data Analyst", domain: "Disparity data & outcome metrics", icon: "" },
  { id: "community", name: "Community Liaison", domain: "Engagement & lived experience", icon: "" },
  { id: "cultural", name: "Cultural Specialist", domain: "Cultural responsiveness & intersectionality", icon: "" },
  { id: "program", name: "Program Evaluator", domain: "HCBS waiver & service delivery", icon: "" },
  { id: "access", name: "Accessibility Expert", domain: "Physical & digital accessibility", icon: "" },
  { id: "comms", name: "Communications Analyst", domain: "Plain language & public engagement", icon: "" },
  { id: "fiscal", name: "Fiscal Analyst", domain: "Budget equity & resource allocation", icon: "" },
  { id: "workforce", name: "Workforce Analyst", domain: "DSP workforce equity & development", icon: "" },
  { id: "transition", name: "Transition Specialist", domain: "Youth transition & employment equity", icon: "" },
  { id: "housing", name: "Housing Analyst", domain: "Accessible housing & community living", icon: "" },
  { id: "tech", name: "Technology Analyst", domain: "Assistive technology & digital equity", icon: "" },
];

/* ------------------------------------------------------------------ */
/*  RESEARCH TEMPLATES                                                 */
/* ------------------------------------------------------------------ */
const RESEARCH_TEMPLATES: ResearchTemplate[] = [
  { icon: "", label: "Equity Impact Assessment", tier: "deep", prompt: "Conduct a comprehensive equity impact assessment for disability services. Analyze current policies through the DSD Equity Framework, identify disparities using 2024 data, evaluate compliance with EO 14091 and EO 13985, and provide actionable recommendations with implementation timelines.", agents: ["policy", "equity", "data", "legal"], kbDocs: ["eo-14091", "eo-13985", "dsd-equity-framework", "equity-lens-tool", "disparity-data-2024"] },
  { icon: "", label: "ADA/Olmstead Compliance Review", tier: "deep", prompt: "Perform a detailed compliance review against ADA requirements, Section 504 obligations, and the Olmstead decision. Cross-reference Minnesota's Olmstead Plan with current service delivery practices and identify gaps requiring remediation.", agents: ["legal", "policy", "program", "access"], kbDocs: ["ada-1990", "section-504", "olmstead", "mn-olmstead-plan"] },
  { icon: "", label: "Disparity Analysis", tier: "deep", prompt: "Analyze current disparity data across disability services. Examine access rates, service utilization, outcomes, and satisfaction metrics disaggregated by race, ethnicity, age, geography, and disability type. Identify root causes and recommend targeted interventions.", agents: ["data", "equity", "cultural", "program"], kbDocs: ["disparity-data-2024", "intersectionality-brief", "waiver-equity-analysis", "dsd-equity-framework"] },
  { icon: "", label: "Community Engagement Plan", tier: "standard", prompt: "Develop a community engagement plan that centers the voices and lived experiences of people with disabilities. Include strategies for reaching underrepresented populations and ensuring meaningful participation in policy development.", agents: ["community", "cultural", "comms"], kbDocs: ["community-engagement", "cultural-responsiveness", "plain-language-guide"] },
  { icon: "", label: "HCBS Waiver Equity Review", tier: "deep", prompt: "Review Home and Community-Based Services waiver programs through an equity lens. Analyze access patterns, waitlist demographics, service utilization rates, and outcome disparities across waiver types.", agents: ["program", "data", "fiscal", "equity"], kbDocs: ["waiver-equity-analysis", "disparity-data-2024", "dsd-equity-framework", "mn-disability-plan"] },
  { icon: "", label: "Cultural Responsiveness Audit", tier: "standard", prompt: "Audit current disability service delivery practices for cultural responsiveness. Evaluate provider cultural competency, language access, and accommodation of diverse cultural perspectives on disability.", agents: ["cultural", "community", "program", "access"], kbDocs: ["cultural-responsiveness", "intersectionality-brief", "community-engagement", "plain-language-guide"] },
  { icon: "", label: "Policy Gap Analysis", tier: "standard", prompt: "Identify gaps between federal equity mandates and current state/division policies. Map areas where Minnesota disability services policies need strengthening to meet equity requirements.", agents: ["policy", "legal", "equity"], kbDocs: ["eo-14091", "eo-13985", "mn-disability-plan", "dsd-equity-framework", "ada-1990"] },
  { icon: "", label: "Accessibility Compliance Check", tier: "standard", prompt: "Evaluate physical and digital accessibility of disability services programs. Review compliance with ADA Title II requirements and identify barriers to equitable access.", agents: ["access", "legal", "tech", "comms"], kbDocs: ["ada-1990", "section-504", "plain-language-guide"] },
];

/* ------------------------------------------------------------------ */
/*  SYSTEM PROMPT                                                      */
/* ------------------------------------------------------------------ */
const EQUITY_ASSIST_SYSTEM = `You are Equity Assist, the equity research engine for the Minnesota Department of Human Services, Disability Services Division (DSD) One DSD Equity Program.

YOUR ROLE:
You are a specialized equity research assistant that helps DSD staff analyze policies, identify disparities, assess compliance, and develop equity-centered recommendations for disability services.

KNOWLEDGE BASE:
You have access to an internal knowledge base of governing documents, equity tools, and research data including:
- Federal executive orders on racial equity (EO 14091, EO 13985)
- ADA, Section 504, and Olmstead decision requirements
- Minnesota Disability Equity Action Plan and Olmstead Plan
- DSD Equity Framework and Equity Lens Assessment Tool
- Disparity data and intersectionality research
- Community engagement and cultural responsiveness standards
- HCBS waiver equity analysis
- Plain language and accessibility guidelines

RESEARCH APPROACH:
1. Ground all analysis in the governing documents and equity frameworks
2. Use disparity data to support findings with evidence
3. Apply intersectional analysis considering how multiple identities affect outcomes
4. Center the lived experiences of people with disabilities
5. Provide actionable, specific recommendations with clear implementation steps
6. Maintain compliance awareness with federal and state requirements
7. Use plain, accessible language while maintaining analytical rigor

OUTPUT FORMAT:
- Structure responses with clear headings and sections
- Lead with key findings and recommendations
- Support claims with specific references to knowledge base documents
- Include compliance implications where relevant
- End with prioritized action items when appropriate

ETHICAL GUIDELINES:
- Always center equity and the dignity of people with disabilities
- Acknowledge limitations in data or analysis
- Flag potential unintended consequences of recommendations
- Consider intersectional impacts across all recommendations

WRITING AND FORMATTING GUIDELINES (Minnesota DHS Standards):
You must follow Minnesota Department of Human Services writing standards in all responses:
1. Use plain language — write at an 8th-grade reading level. Avoid jargon, acronyms without definitions, and overly technical language.
2. Use person-first language — say "person with a disability" not "disabled person"; "people experiencing homelessness" not "homeless people."
3. Use active voice — say "the team reviewed the data" not "the data was reviewed by the team."
4. Be direct and concise — lead with the most important information. Remove filler words and redundancies.
5. Use inclusive language — reflect the diversity of communities served. Respect cultural identities and terminology preferences.
6. Structure for scannability — use clear headings, short paragraphs (3-4 sentences max), and bullet points only when listing actionable items.
7. Tables — use tables only for quantitative comparisons. Keep tables simple with clear column headers.
8. Avoid walls of text — break long analyses into clearly labeled sections with descriptive headings.
9. Tone — professional, respectful, equity-centered. Avoid bureaucratic or legalistic tone when a plain explanation will do.
10. Data presentation — always contextualize numbers. Say "12% of Black participants compared to 22% of white participants" rather than just listing percentages.
11. Actionable recommendations — every analysis must end with specific, measurable next steps. Do not give vague suggestions.
12. Cultural responsiveness — name communities respectfully using their preferred terminology. Acknowledge historical context when discussing disparities.
`;


/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function EquityAssistPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [researchMode, setResearchMode] = useState<"standard" | "deep">("deep");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [sniffResults, setSniffResults] = useState<Record<string, SniffResult>>({});
  const [activeTab, setActiveTab] = useState<"templates" | "knowledge" | "agents">("templates");
  const [kbFilter, setKbFilter] = useState("All");
  const [showTopPanel, setShowTopPanel] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const buildResearchContext = useCallback(() => {
    const docs = selectedDocs.length > 0
      ? KB_DOCUMENTS.filter(d => selectedDocs.includes(d.id))
      : KB_DOCUMENTS;
    const agents = selectedAgents.length > 0
      ? RESEARCH_AGENTS.filter(a => selectedAgents.includes(a.id))
      : RESEARCH_AGENTS;
    const mode = researchMode === "deep" ? "DEEP RESEARCH MODE" : "STANDARD MODE";
        const docNames = docs.map(d => d.title).join(", ");
        const agentNames = agents.map(a => a.name + " (" + a.domain + ")").join(", ");
        return "\n[" + mode + "]\n[Knowledge Sources: " + docNames + "]\n[Agent Domains: " + agentNames + "]\n";
  }, [selectedDocs, selectedAgents, researchMode]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput("");
    setIsStreaming(true);

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const context = buildResearchContext();
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content });

      let fullResponse = "";
      await callAIStream(
        history,
        {
          agentId: "equity-assist",
          agentName: "Equity Assist",
          agentPurpose: "equity research for disability services",
          maxTokens: 16000,
          systemPromptAddendum: EQUITY_ASSIST_SYSTEM + context,
        },
        (chunk) => {
          if (!chunk.done) {
            fullResponse += chunk.delta;
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m)
            );
          }
        }
      );

      try {
        const checkResult = runL1Check(fullResponse, {
          agentId: "equity-assist",
          outputType: "draft",
          audience: "staff",
          contentType: "text"
        });
        const sniffResult: SniffResult = {
          status: checkResult.canProceed ? "pass" : "warning",
          flags: checkResult.blockingIssues || []
        };
        setSniffResults(prev => ({ ...prev, [assistantId]: sniffResult }));
      } catch {}
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Research error: ${err?.message || "Unable to complete analysis. Please try again."}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, buildResearchContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const runTemplate = (t: ResearchTemplate) => {
    setSelectedDocs(t.kbDocs);
    setSelectedAgents(t.agents);
    setResearchMode(t.tier === "deep" ? "deep" : "standard");
    setShowTopPanel(false);
    setTimeout(() => sendMessage(t.prompt), 100);
  };

  const clearSession = () => {
    setMessages([]);
    setSniffResults({});
    setInput("");
    setSelectedDocs([]);
    setSelectedAgents([]);
    toast.success("Session cleared");
  };

  const downloadResearch = () => {
    if (messages.length === 0) { toast.error("No research to export"); return; }
    const header = `EQUITY ASSIST RESEARCH EXPORT\nDate: ${new Date().toLocaleDateString()}\nMode: ${researchMode === "deep" ? "Deep Research" : "Standard"}\nKnowledge Sources: ${selectedDocs.length || KB_DOCUMENTS.length} documents\nAgent Domains: ${selectedAgents.length || RESEARCH_AGENTS.length} agents\nSniff Check: L1 Active\n${"=".repeat(80)}\n\n`;
    const body = messages.map(m => {
      const role = m.role === "user" ? "RESEARCH QUERY" : "EQUITY ASSIST RESPONSE";
      const ts = new Date(m.timestamp).toLocaleString();
      const sniff = m.role === "assistant" && sniffResults[m.id] ? `\n[Sniff Check L1: ${sniffResults[m.id].status.toUpperCase()}]` : "";
      return `--- ${role} (${ts}) ---\n\n${m.content}${sniff}\n`;
    }).join("\n" + "=".repeat(80) + "\n\n");
    const footer = `\n${"=".repeat(80)}\nGenerated by Equity Assist \u2014 One DSD Equity Program\nMinnesota Department of Human Services, Disability Services Division\n`;
    const text = header + body + footer;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equity-assist-research-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Research downloaded");
  };

  const copyMessage = (text: string, idx: number) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = text;
    const plain = tmp.textContent || tmp.innerText || "";
    navigator.clipboard.writeText(plain).then(() => {
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 2000);
    });
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const formatContent = (text: string): string => {
    let html = text;
    // Escape HTML entities
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr class="my-4 border-gray-300"/>');
    // Tables: detect markdown table blocks and convert them
    html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (tableBlock: string) => {
      const rows = tableBlock.trim().split('\n').filter((r: string) => r.trim());
      if (rows.length < 2) return tableBlock;
      const isSep = (r: string) => /^[\s|:-]+$/.test(r.replace(/[^|:-\s]/g, ''));
      let headerEnd = -1;
      for (let i = 0; i < rows.length; i++) { if (isSep(rows[i])) { headerEnd = i; break; } }
      let out = '<div class="overflow-x-auto my-4"><table class="min-w-full text-sm border-collapse border border-gray-300">';
      rows.forEach((row: string, idx: number) => {
        if (isSep(row)) return;
        const cells = row.split('|').map((c: string) => c.trim()).filter((c: string, i: number, a: string[]) => i > 0 && i < a.length - 1 || (a.length === 2 && i === 0));
        const isHead = headerEnd > 0 && idx < headerEnd;
        const tag = isHead ? 'th' : 'td';
        const cls = isHead ? 'bg-gray-100 font-semibold px-3 py-2 border border-gray-300 text-left' : 'px-3 py-2 border border-gray-300';
        out += '<tr>' + cells.map((c: string) => `<${tag} class="${cls}">${c}</${tag}>`).join('') + '</tr>';
      });
      out += '</table></div>';
      return out;
    });
    // Headings
    html = html.replace(/^### (.+)$/gm, '<h4 class="text-sm font-semibold mt-4 mb-1 text-gray-900">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="text-base font-semibold mt-5 mb-2 text-gray-900">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2 text-gray-900">$1</h2>');
    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><span class="font-medium">$1.</span> $2</li>');
    // Paragraphs
    html = html.replace(/\n{2,}/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  const filteredDocs = kbFilter === "All" ? KB_DOCUMENTS : KB_DOCUMENTS.filter(d => d.category === kbFilter);

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex flex-col h-full w-full bg-white" style={{ height: "calc(100vh - 56px)" }}>

      {/* TOP TABS BAR */}
      <div className="flex-none border-b border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowTopPanel(activeTab === "templates" && showTopPanel ? false : true); setActiveTab("templates"); }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeTab === "templates" && showTopPanel ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Templates
              </button>
              <button
                onClick={() => { setShowTopPanel(activeTab === "knowledge" && showTopPanel ? false : true); setActiveTab("knowledge"); }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeTab === "knowledge" && showTopPanel ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => { setShowTopPanel(activeTab === "agents" && showTopPanel ? false : true); setActiveTab("agents"); }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  activeTab === "agents" && showTopPanel ? "bg-white text-gray-900 shadow-sm font-medium" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                Agents
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setResearchMode(researchMode === "deep" ? "standard" : "deep")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full border transition-colors",
                  researchMode === "deep" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600"
                )}
              >
                {researchMode === "deep" ? "Deep Research" : "Standard"}
              </button>
              {messages.length > 0 && (
                <>
                  <button onClick={downloadResearch} className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                    Download
                  </button>
                  <button onClick={clearSession} className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE TOP PANEL */}
      {showTopPanel && (
        <div className="flex-none border-b border-gray-200 bg-gray-50 overflow-y-auto" style={{ maxHeight: "280px" }}>
          <div className="max-w-5xl mx-auto px-4 py-3">

            {activeTab === "templates" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {RESEARCH_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => runTemplate(t)}
                    disabled={isStreaming}
                    className="text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.tier === "deep" ? "Deep Research" : "Standard"} -- {t.agents.length} agents</div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "knowledge" && (
              <div>
                <div className="flex gap-1 mb-2">
                  {KB_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setKbFilter(cat)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-full transition-colors",
                        kbFilter === cat ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {filteredDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "flex items-start gap-2 text-left p-2 rounded-lg border transition-colors",
                        selectedDocs.includes(doc.id) ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{doc.title}</div>
                        <div className="text-xs text-gray-500 truncate">{doc.description}</div>
                      </div>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full flex-none", AUTHORITY_COLORS[doc.authorityLevel] || "bg-gray-100 text-gray-600")}>
                        {doc.authorityLevel}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedDocs.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{selectedDocs.length} selected</span>
                    <button onClick={() => setSelectedDocs([])} className="text-xs text-blue-600 hover:text-blue-800">Clear selection</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "agents" && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                  {RESEARCH_AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={cn(
                        "text-left p-2 rounded-lg border transition-colors",
                        selectedAgents.includes(agent.id) ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.domain}</div>
                    </button>
                  ))}
                </div>
                {selectedAgents.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">{selectedAgents.length} selected</span>
                    <button onClick={() => setSelectedAgents([])} className="text-xs text-blue-600 hover:text-blue-800">Clear selection</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pt-16">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Equity Assist</h1>
              <p className="text-gray-500 mb-8 max-w-md">
                equity research for the Minnesota DHS Disability Services Division. Select a template above or type your research query below.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {RESEARCH_TEMPLATES.slice(0, 4).map((t, i) => (
                  <button
                    key={i}
                    onClick={() => runTemplate(t)}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">{t.label}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{t.prompt.slice(0, 80)}...</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, msgIdx) => (
              <div key={msg.id} className={cn("mb-6", msg.role === "user" ? "flex justify-end" : "")}>
                {msg.role === "user" ? (
                  <div className="max-w-xl bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-none">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Equity Assist</span>
                      {sniffResults[msg.id] && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          sniffResults[msg.id].status === "pass" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          L1: {sniffResults[msg.id].status}
                        </span>
                      )}
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-800 leading-relaxed pl-8"
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />
                  {msg.role === "assistant" && !isStreaming && (
                    <button
                      onClick={() => copyMessage(msg.content, msgIdx)}
                      className="mt-2 px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                      title="Copy response"
                    >
                      {copiedMsgIdx === msgIdx ? "Copied!" : "Copy"}
                    </button>
                  )}
                    {isStreaming && msg.id === messages[messages.length - 1]?.id && msg.content === "" && (
                      <div className="pl-8 mt-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="flex-none border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {(selectedDocs.length > 0 || selectedAgents.length > 0) && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              {selectedDocs.length > 0 && <span>{selectedDocs.length} knowledge sources</span>}
              {selectedDocs.length > 0 && selectedAgents.length > 0 && <span>--</span>}
              {selectedAgents.length > 0 && <span>{selectedAgents.length} agents</span>}
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask an equity research question..."
                disabled={isStreaming}
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
                style={{ minHeight: "48px", maxHeight: "160px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "48px";
                  target.style.height = Math.min(target.scrollHeight, 160) + "px";
                }}
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
            >
              {isStreaming ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-gray-400">
              Equity Assist -- One DSD Equity Program -- Minnesota DHS Disability Services Division
            </p>
            <p className="text-[11px] text-gray-400">
              Sniff Check L1 Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
