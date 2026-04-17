// Supabase Edge Function: export-pdf
// Server-side PDF generation for equity reports, policy documents, and metrics
// Uses a lightweight HTML-to-PDF approach via Deno
//
// Supported report types:
// - equity-report: Equity analysis report with metrics and recommendations
// - policy-document: Policy document export
// - metrics-snapshot: KPI dashboard snapshot
// - workflow-summary: Workflow run summary

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Configurable CORS: set ALLOWED_ORIGINS as comma-separated list in Edge Function secrets.
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

function errorResponse(status: number, message: string, cors: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...cors, "Content-Type": "application/json" } }
  );
}

// Allowed email domains for export operations
const ALLOWED_EMAIL_DOMAINS = ["state.mn.us", "mn.gov"];

async function authenticateRequest(req: Request): Promise<{ userId: string; email: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  // Enforce email domain — only allowed organization domains can export
  const email = user.email || "";
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
    console.warn(`Export access denied for email domain: ${domain}`);
    return null;
  }

  return { userId: user.id, email };
}

interface ReportData {
  type: "equity-report" | "policy-document" | "metrics-snapshot" | "workflow-summary";
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
  }>;
  metadata?: {
    author?: string;
    date?: string;
    program?: string;
    division?: string;
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateReportHtml(data: ReportData): string {
  const date = data.metadata?.date || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const author = data.metadata?.author || "One DSD Equity Platform";
  const division = data.metadata?.division || "Disability Services Division";
  const program = data.metadata?.program || "One DSD Equity Program";

  const sectionsHtml = data.sections
    .map(section => {
      let html = `<div class="section">`;
      html += `<h2>${escapeHtml(section.heading)}</h2>`;

      // Convert markdown-style content to HTML
      const contentHtml = escapeHtml(section.content)
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n- /g, "</p><ul><li>")
        .replace(/\n/g, "<br>");
      html += `<p>${contentHtml}</p>`;

      if (section.table) {
        html += `<table><thead><tr>`;
        html += section.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("");
        html += `</tr></thead><tbody>`;
        html += section.table.rows
          .map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
          .join("");
        html += `</tbody></table>`;
      }

      html += `</div>`;
      return html;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title)}</title>
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    body {
      font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 7.5in;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #003865;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header .org {
      font-size: 10pt;
      color: #003865;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .header h1 {
      font-size: 22pt;
      color: #003865;
      margin: 8px 0;
      line-height: 1.2;
    }
    .header .meta {
      font-size: 9pt;
      color: #666;
    }
    .dsd-badge {
      display: inline-block;
      background: #78BE21;
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
      font-family: sans-serif;
      margin-right: 8px;
    }
    h2 {
      font-size: 14pt;
      color: #003865;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 6px;
      margin-top: 28px;
    }
    p { margin: 8px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }
    th {
      background: #003865;
      color: white;
      padding: 8px 12px;
      text-align: left;
      font-family: sans-serif;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e8e8e8;
    }
    tr:nth-child(even) td { background: #f8f8f8; }
    .section { margin-bottom: 20px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
      font-size: 8pt;
      color: #999;
      text-align: center;
    }
    .equity-banner {
      background: #FFF8E1;
      border-left: 4px solid #FFB71B;
      padding: 12px 16px;
      margin: 16px 0;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="org">Minnesota Department of Human Services</div>
    <div class="org">${escapeHtml(division)}</div>
    <h1><span class="dsd-badge">DSD</span> ${escapeHtml(data.title)}</h1>
    <div class="meta">${escapeHtml(program)} &middot; ${escapeHtml(author)} &middot; ${escapeHtml(date)}</div>
  </div>

  <div class="equity-banner">
    This document was generated by the One DSD Equity Platform.
    All analysis incorporates the DSD equity framework and centers community voice.
  </div>

  ${sectionsHtml}

  <div class="footer">
    Minnesota DHS &middot; Disability Services Division &middot; One DSD Equity Program &middot; Generated ${date}
    <br>Confidential &mdash; For Internal Use Only &mdash; Subject to MGDPA
  </div>
</body>
</html>`;
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "POST method required", cors);
  }

  // Authenticate
  const authUser = await authenticateRequest(req);
  if (!authUser) {
    return errorResponse(401, "Authentication required", cors);
  }

  try {
    const reportData: ReportData = await req.json();

    // Validate report data
    if (!reportData.type || !reportData.title || !reportData.sections) {
      return errorResponse(400, "Report must include type, title, and sections", cors);
    }

    const validTypes = ["equity-report", "policy-document", "metrics-snapshot", "workflow-summary"];
    if (!validTypes.includes(reportData.type)) {
      return errorResponse(400, `Invalid report type. Must be one of: ${validTypes.join(", ")}`, cors);
    }

    // Set metadata defaults
    reportData.metadata = {
      author: authUser.email,
      date: new Date().toISOString().slice(0, 10),
      program: "One DSD Equity Program",
      division: "Disability Services Division",
      ...reportData.metadata,
    };

    // Generate HTML report
    const html = generateReportHtml(reportData);

    // Return format based on Accept header
    const accept = req.headers.get("accept") || "";

    if (accept.includes("text/html")) {
      return new Response(html, {
        headers: {
          ...cors,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="${reportData.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}.html"`,
        },
      });
    }

    // Default: return HTML as downloadable file
    // Note: True server-side PDF rendering requires a headless browser (Puppeteer/Playwright)
    // which is not available in Supabase Edge Functions. The HTML output is print-optimized
    // with @page CSS and can be converted to PDF via browser print or an external service.
    return new Response(html, {
      headers: {
        ...cors,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${reportData.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}.html"`,
        "X-PDF-Note": "Print this HTML to PDF using browser print (Ctrl+P) for best results. " +
          "The document includes @page print styles optimized for PDF output.",
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return errorResponse(500, err instanceof Error ? err.message : "Export failed", cors);
  }
});
