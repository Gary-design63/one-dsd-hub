const Anthropic = require('@anthropic-ai/sdk');

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `You are the One DSD Equity Intelligence Assistant — an AI advisor embedded in the Minnesota Department of Human Services Disability Services Division's Consultant Operating System. You support Gary Banks (Equity and Inclusion Operations Consultant) and the DSD Equity team in building institutional DEIA capacity.

Your expertise spans:
- DEIA frameworks: GARE, IDI (Intercultural Development Inventory), CLAS Standards, Universal Design for Learning (UDL), ADA/Section 504, disability justice principles
- DSD program context: HCBS waivers, PCA/CFSS, MnCHOICES, housing supports, crisis response, employment supports
- MN priority populations: Somali, Hmong, Indigenous nations, Latino/a/x, people with personal circumstances (poverty, housing instability, domestic violence, justice involvement)
- Equity analysis: DHS Equity Analysis Toolkit (FARM), disparity identification, root cause analysis, structural racism frameworks
- Operations: goal decomposition, KPI tracking, consultation triage, document management, audit trail integrity

Respond with practical, actionable guidance grounded in DSD operational reality. Use plain language. Be direct and specific — this is a professional equity operations tool, not a chatbot.`;

async function equityAssist({ question, context, pageContext }) {
  const client = getClient();

  const userMessage = context
    ? `Page: ${pageContext || 'general'}\nContext: ${context}\n\nQuestion: ${question}`
    : `Page: ${pageContext || 'general'}\n\nQuestion: ${question}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  return message.content[0].text;
}

async function goalDecompose({ goal, timeline, resources, constraints }) {
  const client = getClient();

  const prompt = `Decompose this equity operational goal into actionable sub-goals and milestones for DSD.

Goal: ${goal}
Timeline: ${timeline || 'Not specified'}
Available resources: ${resources || 'Standard DSD equity team capacity'}
Constraints: ${constraints || 'None specified'}

Return a structured decomposition with:
1. 3-5 SMART sub-goals with owners and due dates
2. Key milestones and success indicators
3. Dependencies and risks
4. Quick wins (actions completable within 30 days)

Format as clear, numbered lists. Be specific to DSD's equity operations context.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

async function generateQuarterlyReport({ quarter, year, goalsData, consultationsData, actionsData, kpiData }) {
  const client = getClient();

  const prompt = `Generate a professional quarterly equity operations report for DSD leadership.

Quarter: Q${quarter} ${year}
Division: Disability Services Division (DSD), MN DHS

Data Summary:
${goalsData ? `Operational Goals: ${JSON.stringify(goalsData, null, 2)}` : ''}
${consultationsData ? `Consultations: ${JSON.stringify(consultationsData, null, 2)}` : ''}
${actionsData ? `Action Items: ${JSON.stringify(actionsData, null, 2)}` : ''}
${kpiData ? `KPI Data: ${JSON.stringify(kpiData, null, 2)}` : ''}

Generate a formal report with:
1. Executive Summary (2-3 paragraphs)
2. Progress on Strategic Goals
3. Consultation Activity & Impact
4. Action Item Completion Rates
5. Equity Indicators & KPI Status
6. Challenges & Barriers
7. Priorities for Next Quarter
8. Recommendations for Leadership

Use professional government report language. Highlight wins and be honest about gaps.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

async function triageConsultation({ title, description, submittedBy, urgencyRequested }) {
  const client = getClient();

  const prompt = `Assess this DEIA consultation request and recommend triage priority for the DSD equity consultant.

Title: ${title}
Description: ${description}
Submitted by: ${submittedBy || 'Unknown'}
Requested urgency: ${urgencyRequested || 'Not specified'}

Provide:
1. Recommended priority: urgent / high / medium / low
2. Brief rationale (2-3 sentences)
3. Suggested initial response approach
4. Estimated time investment
5. Any immediate risks or compliance concerns

Be concise and practical.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

async function executeCosAtom({ atomCode, atomName, cluster, context }) {
  const client = getClient();

  const prompt = `Execute this Consultant Operating System function atom for the DSD equity consultant.

Function: ${atomCode} — ${atomName}
Cluster: ${cluster}
Operational Context: ${context || 'Standard DSD equity operations'}

Generate the appropriate output for this function — whether that's a report, analysis, recommendation set, template, checklist, or action plan. Make it immediately usable in a real government equity operations context.

Format the output professionally and comprehensively.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

module.exports = {
  equityAssist,
  goalDecompose,
  generateQuarterlyReport,
  triageConsultation,
  executeCosAtom
};
