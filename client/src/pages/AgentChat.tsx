import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Paperclip } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { callAIStream } from "@/core/aiProvider";
import { runL1Check } from "@/core/SniffCheckEngine";
import type { ConversationMessage, SniffCheckResult } from "@/types";

const AGENT_CONFIG: Record<string, {
  name: string;
  purpose: string;
  systemAddendum?: string;
  starters: string[];
  outputType: "draft" | "policy" | "data" | "communication" | "training" | "report";
}> = {
  "policy-drafting": {
    name: "Policy Drafting Agent",
    purpose: "Draft equity-aligned policy documents, testimony, guidance memos, and legislative briefs for Minnesota DSD",
    starters: [
      "Draft a policy brief on reducing racial disparities in CADI waiver access",
      "Write legislative testimony supporting Employment First funding for FY2026",
      "Create an equity impact analysis for proposed HCBS rate changes",
      "Draft a guidance memo on language access obligations for county case managers"
    ],
    outputType: "policy"
  },
  "equity-data": {
    name: "Equity Data Agent",
    purpose: "Analyze disaggregated disability services data and generate equity disparity reports with actionable recommendations",
    starters: [
      "Analyze CADI waitlist disparities by race/ethnicity and recommend interventions",
      "Generate a disparity analysis template for waiver enrollment by county",
      "What does the data tell us about Black Minnesotans' access to DD waiver services?",
      "Create an equity metrics dashboard spec for DSD leadership"
    ],
    outputType: "data"
  },
  "training-design": {
    name: "Training Design Agent",
    purpose: "Create complete equity training curricula, modules, and assessments for disability services workforce",
    starters: [
      "Design a 2-hour module on disability justice for DSP supervisors",
      "Create a cultural responsiveness training for county case managers serving Somali families",
      "Develop an Employment First training curriculum for day service providers",
      "Write learning objectives for an HCBS Settings Rule compliance training"
    ],
    outputType: "training"
  },
  "community-outreach": {
    name: "Community Outreach Agent",
    purpose: "Create culturally responsive outreach materials for BIPOC disability communities with language justice",
    starters: [
      "Draft a Disability Hub MN outreach letter for East African communities in Somali",
      "Create talking points for trusted messengers explaining CADI waiver eligibility",
      "Design a community engagement plan for Indigenous disability service access",
      "Write a plain-language guide to self-directed services for Hmong families"
    ],
    outputType: "communication"
  },
  "dwrs-rate": {
    name: "DWRS Rate Analysis Agent",
    purpose: "Analyze Disability Waiver Rate System impacts, model 2026 transitions, and support provider sustainability",
    starters: [
      "Analyze how DWRS 2026 changes affect small BIPOC-owned providers",
      "Calculate the equity implications of proposed DSP wage floor changes",
      "Model rate impacts for rural vs. metro residential providers under 2026 framework",
      "What are the DSP workforce stability implications of current DD waiver rates?"
    ],
    outputType: "report"
  },
  "olmstead-monitor": {
    name: "Olmstead Monitoring Agent",
    purpose: "Track Minnesota Olmstead Plan progress and identify community integration compliance gaps",
    starters: [
      "Generate an Olmstead progress report for Q4 2024",
      "Identify gaps in our community transition supports for people leaving nursing facilities",
      "Draft the annual Olmstead subcabinet report narrative",
      "Analyze HCBS settings rule compliance status across DD waiver residential providers"
    ],
    outputType: "report"
  },
  "employment-first": {
    name: "Employment First Agent",
    purpose: "Support Employment First policy implementation and analyze employment outcome disparities",
    starters: [
      "Analyze racial disparities in competitive integrated employment outcomes",
      "Create an Employment First training module for day service providers",
      "Draft a policy brief on VRS-waiver coordination gaps affecting BIPOC job seekers",
      "Generate an Employment First implementation checklist for counties"
    ],
    outputType: "policy"
  },
  "waiver-navigator": {
    name: "Waiver Navigation Agent",
    purpose: "Help staff and communities navigate Minnesota's CADI, DD, BI, EW, and AC waiver programs",
    starters: [
      "Create a plain-language comparison of CADI vs DD waiver for a family",
      "Explain CADI eligibility criteria in accessible language for a community presentation",
      "Draft an FAQ about the DD waiver waitlist for county staff",
      "What HCBS services are available under the Brain Injury waiver?"
    ],
    outputType: "communication"
  },
  "hcbs-settings": {
    name: "HCBS Settings Compliance Agent",
    purpose: "Review provider settings for HCBS Settings Rule compliance and generate remediation plans",
    starters: [
      "Create a self-assessment checklist for group home HCBS settings rule compliance",
      "Draft remediation guidance for a provider with rights restriction issues",
      "Explain the 'institutional settings' determination process to a provider",
      "Generate a site review protocol for corporate foster care settings"
    ],
    outputType: "report"
  },
  "stakeholder-engagement": {
    name: "Stakeholder Engagement Agent",
    purpose: "Design stakeholder engagement processes, create meeting materials, and track advisory panel outcomes",
    starters: [
      "Design a community advisory panel structure for the DSD equity plan",
      "Create a meeting facilitation guide for a listening session with Latinx disability families",
      "Draft an action item tracker template from our last community engagement session",
      "Write an engagement plan for reaching Greater MN disability communities"
    ],
    outputType: "draft"
  },
  "legislative-affairs": {
    name: "Legislative Affairs Agent",
    purpose: "Monitor Minnesota legislature, draft testimony, and analyze disability equity bill impacts",
    starters: [
      "Draft written testimony supporting the DSP wage floor legislation",
      "Analyze the equity implications of proposed Medicaid managed care expansion",
      "Create a legislative brief on Employment First funding for the 2025 session",
      "What bills from the 2024 session affect disability equity in Minnesota?"
    ],
    outputType: "policy"
  },
  "disability-hub": {
    name: "Disability Hub MN Agent",
    purpose: "Support Disability Hub MN resource navigation and multilingual community connection",
    starters: [
      "Create a benefits navigation guide for newly arrived Somali families with disabled members",
      "Draft a Disability Hub MN referral script for county social workers",
      "Generate a plain-language MA-EPD (work incentive) explanation for job seekers",
      "Create a Hub resource flyer in both English and Spanish"
    ],
    outputType: "communication"
  },
  "communications": {
    name: "Communications Agent",
    purpose: "Draft all external communications including press releases, web content, and executive memos",
    starters: [
      "Write a press release announcing the new DSD equity dashboard launch",
      "Draft web content explaining the Olmstead Plan for the DHS website",
      "Create a community newsletter about DWRS 2026 changes for families",
      "Write an executive briefing memo on Q1 equity metrics for the DHS Commissioner"
    ],
    outputType: "communication"
  },
  "meta-audit": {
    name: "Meta-Audit and QA Agent",
    purpose: "Run Sniff Checks on outputs and ensure equity alignment, language quality, and force multiplier compliance",
    starters: [
      "Run an L2 equity sniff check on this policy document: [paste document]",
      "Audit this training material for ableist language and structural analysis gaps",
      "Review this community outreach letter for cultural responsiveness and language justice",
      "Check this data report for disaggregation completeness and equity framing"
    ],
    outputType: "report"
  }
};

const audienceOptions = [
  { value: "executive", label: "Executive/Leadership" },
  { value: "staff", label: "Staff/County Workers" },
  { value: "community", label: "Community Members" },
  { value: "provider", label: "Service Providers" },
  { value: "legislature", label: "Legislature" },
  { value: "internal", label: "Internal/Working Doc" }
];

function MessageBubble({
  message,
  sniffResult
}: {
  message: ConversationMessage;
  sniffResult?: SniffCheckResult;
}) {
  const isUser = message.role === "user";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold ${
        isUser ? "bg-[#003865]" : "bg-[#78BE21]"
      }`}>
        {isUser ? "U" : "A"}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] space-y-1 ${isUser ? "items-end flex flex-col" : ""}`}>
        <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#003865] text-white rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Metadata and sniff check */}
        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isUser ? "flex-row-reverse" : ""}`}>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {!isUser && sniffResult && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={`flex items-center gap-1 font-medium ${
                    sniffResult.canProceed ? "text-green-600" : "text-red-600"
                  }`}>
                    L1 Check: {sniffResult.overallStatus}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium mb-1">{sniffResult.summary}</p>
                  {sniffResult.recommendations.length > 0 && (
                    <ul className="text-xs space-y-0.5">
                      {sniffResult.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="hover:text-foreground transition-colors text-xs"
              title="Copy to clipboard"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = AGENT_CONFIG[agentId || ""] || {
    name: "Agent",
    purpose: "General equity assistance",
    starters: [],
    outputType: "draft" as const
  };

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState<string>("staff");
  const [sniffResults, setSniffResults] = useState<Record<string, SniffCheckResult>>({});
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const aiMessages = [...messages, userMsg].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      let fullContent = "";
      const assistantMsgId = `assistant-${Date.now()}`;

      await callAIStream(
        aiMessages,
        {
          agentId: agentId || "unknown",
          agentName: agent.name,
          agentPurpose: agent.purpose,
          systemPromptAddendum: `Current audience: ${audience}\nOutput type: ${agent.outputType}`
        },
        (chunk) => {
          if (!chunk.done) {
            fullContent += chunk.delta;
            setStreamingContent(fullContent);
          }
        }
      );

      setStreamingContent("");

      const assistantMsg: ConversationMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
        metadata: {
          model: "claude-opus-4-5"
        }
      };

      // Run L1 sniff check
      const sniffResult = runL1Check(fullContent, {
        agentId: agentId || "unknown",
        outputType: agent.outputType,
        audience: audience as "executive" | "staff" | "community" | "provider" | "legislature" | "internal",
        contentType: "text"
      });

      setSniffResults(prev => ({ ...prev, [assistantMsgId]: sniffResult }));
      setMessages(prev => [...prev, assistantMsg]);

      if (!sniffResult.canProceed) {
        toast.warning("Sniff Check flagged issues - review recommendations", {
          description: sniffResult.blockingIssues[0]
        });
      }
    } catch (error) {
      const errorMsg: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}. Please check your API key and try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error("Agent request failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, agentId, agent, audience]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setSniffResults({});
    toast.success("Conversation cleared");
  };

  const downloadConversation = () => {
    const text = messages.map(m =>
      `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleString()}\n${m.content}\n`
    ).join("\n---\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentId}-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation downloaded");
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Link to="/agents">
            <Button variant="ghost" size="sm">
              Agents
            </Button>
          </Link>

          <div className="flex items-center gap-3 flex-1">
            <div>
              <h2 className="text-sm font-semibold">
                <EditableText id={`chat.${agentId}.name`} defaultValue={agent.name} />
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                <EditableText id={`chat.${agentId}.purpose`} defaultValue={agent.purpose.slice(0, 80) + "..."} />
              </p>
            </div>
          </div>

          {/* Audience selector */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Audience:</span>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={downloadConversation} className="text-xs h-8">
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation} className="text-xs h-8">
              Clear
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
              <div>
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{agent.purpose}</p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-[#003865]/5 px-3 py-2 rounded-lg text-muted-foreground">
                Primary Directive active · 39 Meta-Skills applied · Sniff Check L1 enabled
              </div>

              <div className="w-full max-w-lg space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Try asking...</p>
                {agent.starters.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(starter)}
                    className="w-full text-left px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors border hover:border-[#003865]/30"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              sniffResult={message.role === "assistant" ? sniffResults[message.id] : undefined}
            />
          ))}

          {/* Streaming indicator */}
          {isLoading && streamingContent && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#78BE21] flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="rounded-lg rounded-tl-sm px-4 py-3 bg-muted text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-1 h-4 bg-foreground ml-0.5 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#78BE21] flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold">
                A
              </div>
              <div className="rounded-lg rounded-tl-sm px-4 py-3 bg-muted">
                <span className="text-sm text-muted-foreground">{agent.name} is working...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${agent.name}... (Enter to send, Shift+Enter for new line)`}
                className="min-h-[52px] max-h-[200px] resize-none pr-4 text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="file-upload"
                className="h-[26px] w-[52px] flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                title="Upload multimedia or document"
              >
                <Paperclip className="h-4 w-4" />
              </label>
              <input
                id="file-upload"
                type="file"
                accept="audio/*,video/*,image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInput(prev => prev + (prev ? "\n" : "") + `[Attached: ${file.name}]`);
                  }
                }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="h-[26px] w-[52px] flex-shrink-0 text-xs"
              >
                {isLoading ? "..." : "Send"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            All outputs governed by Primary Directive · L1 Sniff Check active · Audience: {audienceOptions.find(o => o.value === audience)?.label}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
