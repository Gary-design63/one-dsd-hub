import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { callAIStream } from "@/core/aiProvider";
import { runL1Check } from "@/core/SniffCheckEngine";
import type { ConversationMessage, SniffCheckResult } from "@/types";

const EQUITY_ASSIST_PURPOSE = `Primary research and consultation interface — an exponential extension of the Equity and Inclusion Operations Consultant. You ground every response in real data, real frameworks, and real community context.

CORE CAPABILITIES:
1. COMMUNITY PROFILES — Demographics, cultural context, service gaps, language needs, partnership status for all Minnesota communities served
2. EQUITY METRICS — Disaggregated data, disparity ratios, trend analysis, benchmark comparisons across race, ethnicity, language, ability, age
3. POLICY DOCUMENTS — Current policies, equity impact assessments, compliance status, Olmstead Plan, HCBS Settings Rule
4. TRAINING DATA — Staff competency levels, completion rates, curriculum gaps, cultural competency benchmarks
5. KNOWLEDGE BASE — CLAS Standards, HCBS guidance, DHS Equity Analysis Toolkit (13-Point Equity Rubric), 6-Goal Operational Plan, 8-system DEIA Ecosystem
6. CROSS-AGENT RESEARCH — Synthesize knowledge across all 14 specialized agents for comprehensive answers

CONSULTATION TIERS:
- Tier 1 (Quick Guidance): Policy lookups, data points, framework references — respond immediately
- Tier 2 (Analysis): Equity impact assessment, community context synthesis, disparity analysis — provide structured analysis
- Tier 3 (Strategic): Multi-system recommendations, implementation planning, stakeholder mapping — provide comprehensive consultation

RESPONSE PROTOCOL:
1. Always identify which knowledge bases you are drawing from
2. Cite specific data points when available
3. Apply the equity lens: Who benefits? Who is burdened? Who was consulted? Who decides?
4. Recommend concrete next steps grounded in the DEIA 3-year plan phases
5. Flag when data is insufficient and recommend what data collection is needed
6. Cross-reference CLAS Standards and HCBS requirements where applicable

You are backed by: DHS Equity Analysis Toolkit, CLAS Standards, HCBS Settings Rule, Minnesota community cultural profiles, CHOICE Framework, 6-Goal Operational Plan, 8-System DEIA Ecosystem, and the Sniff Check methodology.

WRITING AND FORMATTING GUIDELINES (Minnesota DHS Standards):
You must follow Minnesota Department of Human Services writing standards in all responses:
1. Use plain language at an 8th-grade reading level. Avoid jargon and define acronyms on first use.
2. Use person-first language (e.g., "person with a disability" not "disabled person").
3. Use active voice and be direct — lead with the most important information.
4. Use inclusive language that reflects the diversity of communities served.
5. Structure for scannability — clear headings, short paragraphs (3-4 sentences max), bullet points only for actionable items.
6. Use tables only for quantitative comparisons with clear column headers.
7. Always contextualize data (e.g., "12% of Black participants compared to 22% of white participants").
8. End every analysis with specific, measurable next steps.
9. Maintain a professional, respectful, equity-centered tone. Avoid bureaucratic language.
10. Name communities respectfully using preferred terminology and acknowledge historical context when discussing disparities.`;
const QUICK_PROMPTS = [
  { icon: "📊", label: "Disparity analysis", prompt: "Show me the current equity disparity data across all dimensions. What are the most critical gaps and what interventions should I prioritize?" },
  { icon: "👥", label: "Community context", prompt: "Summarize the community profiles and cultural contexts I should be aware of for current DSD programs. Focus on service gaps and language needs." },
  { icon: "📋", label: "Policy review", prompt: "What policies need equity review? Apply the Sniff Check methodology and 13-Point Equity Rubric to identify concerns." },
  { icon: "🎯", label: "Goal progress", prompt: "What is our progress on equity goals? Identify barriers and recommend actions aligned to the DEIA 3-year implementation plan." },
  { icon: "📖", label: "CLAS Standards", prompt: "How are we performing against CLAS Standards? Where are the gaps in culturally and linguistically appropriate services?" },
  { icon: "🤖", label: "Agent overview", prompt: "Give me a status overview of all active agents and their domains. How should I leverage them to multiply my capacity this week?" },
];

export default function EquityAssist() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sniffResults, setSniffResults] = useState<Record<string, SniffCheckResult>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);
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
          agentId: "equity-assist",
          agentName: "Equity Assist",
          agentPurpose: EQUITY_ASSIST_PURPOSE,
          systemPromptAddendum: `Current page context: ${location.pathname}\nThe user is the Equity and Inclusion Operations Consultant. You are their exponential extension — multiply their capacity across every domain.`
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
        metadata: { model: "claude-opus-4-5" }
      };

      // Run L1 sniff check
      const sniffResult = runL1Check(fullContent, {
        agentId: "equity-assist",
        outputType: "report",
        audience: "staff",
        contentType: "text"
      });

      setSniffResults(prev => ({ ...prev, [assistantMsgId]: sniffResult }));
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}. Please check your API key and try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error("Equity Assist request failed");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, location.pathname]);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setSniffResults({});
    setStreamingContent("");
  };

  // Floating trigger button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#003865] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group"
        title="Open Equity Assist"
      >
        <div className="w-9 h-9 rounded-xl bg-[#78BE21]/20 border border-[#78BE21]/30 flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
        <div className="text-left">
          <span className="text-sm font-semibold block leading-tight">Equity Assist</span>
          <span className="text-[10px] text-white/60 leading-tight">Research &amp; Consult</span>
        </div>
        <span className="flex h-2.5 w-2.5 ml-1 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78BE21] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#78BE21]"></span>
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <>
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
        <div className="fixed right-0 top-0 z-50 h-full w-16 bg-white shadow-2xl border-l flex flex-col items-center">
          <div className="w-full py-3 bg-[#003865] flex flex-col items-center gap-2">
            <span className="text-lg">✨</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white text-xs"
              title="Expand"
            >
              ◀
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </>
    );
  }
  // Full panel
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-[480px] bg-white shadow-2xl border-l flex flex-col" style={{ maxWidth: "90vw" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#003865] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#78BE21]/20 border border-[#78BE21]/30 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Equity Assist</h3>
              <p className="text-xs text-white/60">Research &amp; Consultation</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearConversation}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white text-xs"
              title="New conversation"
            >
              ↻
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white text-xs"
              title="Minimize"
            >
              —
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70 hover:text-white text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="p-5">
              {/* Welcome */}
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003865] to-[#005a9e] mx-auto mb-3 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <h4 className="font-semibold text-sm">Equity Assist</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                  Your research partner grounded in CLAS Standards, HCBS guidance, the DHS Equity Analysis Toolkit, and live platform knowledge.
                </p>
              </div>

              {/* Tier indicator */}
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Research</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Quick prompts */}
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.prompt)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border hover:border-[#003865]/30 hover:bg-[#003865]/5 transition-all text-left group"
                  >
                    <span className="text-base flex-shrink-0">{qp.icon}</span>
                    <span className="text-xs font-medium text-foreground">{qp.label}</span>
                  </button>
                ))}
              </div>

              {/* Capabilities */}
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Research-backed responses</span> — Equity Assist draws from community profiles, equity metrics, policy documents, training data, CLAS Standards, HCBS guidance, and the full DHS Equity Analysis Toolkit. All guidance is grounded in Minnesota DSD context.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-sm">✨</span>
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    message.role === "user"
                      ? "bg-[#003865] text-white"
                      : "bg-muted text-foreground"
                  )}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {/* Streaming content */}
              {isLoading && streamingContent && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-sm">✨</span>
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-muted text-[13px] leading-relaxed">
                    <div className="whitespace-pre-wrap">{streamingContent}</div>
                    <span className="inline-block w-1 h-4 bg-[#003865] ml-0.5 animate-pulse rounded-sm" />
                  </div>
                </div>
              )}

              {isLoading && !streamingContent && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#78BE21]/15 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-sm">✨</span>
                  </div>
                  <div className="rounded-2xl px-3.5 py-2.5 bg-muted">
                    <span className="text-xs text-muted-foreground">Equity Assist is researching...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* Input */}
        <div className="border-t p-3 bg-white">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Equity Assist..."
              className="min-h-[44px] max-h-[120px] resize-none text-sm flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="h-[44px] px-4 bg-[#003865] hover:bg-[#002a4a] text-white"
            >
              {isLoading ? "..." : "Send"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            DHS Equity Toolkit · CLAS Standards · HCBS Guidance · Sniff Check L1 Active
          </p>
        </div>
      </div>
    </>
  );
}
