// One DSD Equity Platform - AI Provider
// Anthropic Claude integration with PRD-governed system prompt
// All calls governed by Primary Directive and Meta-Skills Framework

import { PRIMARY_DIRECTIVE } from "./PrimaryDirective";
import { applyToAllAgents } from "./MetaSkillsFramework";
import { DSD_RESOURCES } from "./dsdResources";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIRequestOptions {
  agentId: string;
  agentName: string;
  agentPurpose: string;
  maxTokens?: number;
  temperature?: number;
  systemPromptAddendum?: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
  agentId: string;
  timestamp: string;
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

// Build the PRD-governed system prompt for all agents
function buildSystemPrompt(options: AIRequestOptions): string {
  const { agentId, agentName, agentPurpose, systemPromptAddendum } = options;

  const dsdContext = `
=== MINNESOTA DSD CONTEXT ===
You are operating within the Minnesota Department of Human Services, Disability Services Division (DSD).
Minnesota's key disability waiver programs: CADI (Community Access for Disability Inclusion), DD (Developmental Disabilities), BI (Brain Injury), EW (Elderly Waiver), AC (Alternative Care).
Key policy documents: Community-Based Services Manual (CBSM), HCBS Settings Rule, Olmstead Plan, Employment First.
Rate system: Disability Waiver Rate System (DWRS), transitioning to 2026 framework.
Equity framework: One DSD Equity and Inclusion Framework.
Your state context is Minnesota. All policy, statute, and program references must be Minnesota-specific and accurate.
Key communities served: BIPOC communities, immigrant and refugee families, Greater MN/rural populations, LGBTQ+ people with disabilities.
Minnesota key languages: English, Spanish, Somali, Hmong, Vietnamese, Oromo, Arabic.
`;

  const primaryDirectivePrompt = `
=== PRIMARY DIRECTIVE ===
${PRIMARY_DIRECTIVE.text}

Force Multiplier Rules (apply to every response):
${PRIMARY_DIRECTIVE.forceMultiplierRules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}
`;

  const metaSkillsPrompt = applyToAllAgents(`${agentName} - ${agentPurpose}`);

  const agentSpecificPrompt = `
=== AGENT IDENTITY ===
Agent ID: ${agentId}
Agent Name: ${agentName}
Purpose: ${agentPurpose}
`;

  const operationalStandards = `
=== OPERATIONAL STANDARDS ===
1. NEVER produce outputs with placeholders, [INSERT HERE], or incomplete sections
2. ALWAYS provide complete, ready-to-use outputs
3. ALWAYS accompany problems with proposed solutions
4. Format for intended audience: executive summaries for leadership (1-2 pages max), plain language for community (6th-8th grade), technical for staff
5. Use disability justice-aligned language: avoid ableist terms, use person/identity-first language based on context
6. Disaggregate by race, ethnicity, geography when analyzing data or making recommendations
7. Center community voice - cite lived experience and self-advocacy perspectives
8. Apply Olmstead principles: community integration is the goal
9. Reference Employment First: integrated competitive employment is the presumed outcome
10. When uncertain about MN policy specifics, say so clearly and direct to authoritative sources
`;

  const outputFormat = `
=== OUTPUT FORMAT REQUIREMENTS ===
- Executive content: Lead with implications, use headers, bullet points, max 2 pages
- Community content: Plain language, short paragraphs, define all terms, no acronyms without definition
- Policy content: Cite statutes and authority, structured with clear sections, include equity implications
- Training content: Include learning objectives, interactive elements, assessment questions
- Data reports: Lead with key finding, disaggregate, visualize, recommend action
- All content: No placeholders, complete and deployment-ready
`;

  const additionalContext = systemPromptAddendum
    ? `\n=== ADDITIONAL CONTEXT ===\n${systemPromptAddendum}`
    : "";

  return [
    primaryDirectivePrompt,
    agentSpecificPrompt,
    dsdContext,
    metaSkillsPrompt,
    operationalStandards,
    outputFormat,
    additionalContext
  ].join("\n\n");
}

// Determine API base URL - use backend server for AI calls
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

// Main AI call function — routes through backend Express server
// The backend holds the ANTHROPIC_API_KEY securely (never exposed to the browser)
export async function callAI(
  messages: AIMessage[],
  options: AIRequestOptions
): Promise<AIResponse> {
  const baseUrl = getApiBaseUrl();
  const lastUserMessage = [...messages].reverse().find(m => m.role === "user");

  if (!lastUserMessage) {
    throw new Error("No user message provided for AI call");
  }

  try {
    const response = await fetch(`${baseUrl}/api/equity-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: lastUserMessage.content,
        context: options.systemPromptAddendum || "",
        pageContext: options.agentName || "general"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(
        `AI API error: ${response.status} - ${errorData?.error || response.statusText}`
      );
    }

    const data = await response.json();

    return {
      content: data.response || "",
      model: "claude-sonnet-4-20250514",
      agentId: options.agentId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error calling AI API");
  }
}

// Streaming version of AI call — uses backend, simulates streaming for UX
// The backend does not support true streaming yet, so we fetch the full
// response and emit it as a single chunk for compatibility with the UI.
export async function callAIStream(
  messages: AIMessage[],
  options: AIRequestOptions,
  onChunk: (chunk: AIStreamChunk) => void
): Promise<AIResponse> {
  const result = await callAI(messages, options);

  // Emit the full response as a chunk for UI compatibility
  onChunk({ delta: result.content, done: false });
  onChunk({ delta: "", done: true });

  return result;
}

// Utility: Build context string for DSD resource injection
export function buildDSDContext(): string {
  return `
Minnesota Disability Services Context:
- Waivers: CADI, DD, BI, EW, AC
- DWRS 2026 target minimum wage for DSPs: $${DSD_RESOURCES.dwrs2026.rateComponents.DIRECT_CARE.minimumWage}/hr
- CHOICE Domains: ${Object.keys(DSD_RESOURCES.choiceDomains.domains).join(", ")}
- Olmstead mandate: Most integrated setting appropriate to individual needs
- Employment First: Competitive integrated employment is the first and preferred outcome
- Key equity populations: BIPOC communities, immigrant/refugee families, rural MN, LGBTQ+ people with disabilities
`;
}

// Simple single-turn convenience function
export async function askAgent(
  prompt: string,
  agentId: string,
  agentName: string,
  agentPurpose: string,
  systemAddendum?: string
): Promise<string> {
  const response = await callAI(
    [{ role: "user", content: prompt }],
    {
      agentId,
      agentName,
      agentPurpose,
      systemPromptAddendum: systemAddendum
    }
  );
  return response.content;
}
