// One DSD Equity Platform - Report Export Client
// Calls the export-pdf Supabase Edge Function for server-side report generation
// Falls back to client-side HTML generation when Edge Functions are unavailable

import { supabase, isSupabaseAvailable } from "@/core/supabaseClient";

export interface ReportSection {
  heading: string;
  content: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ReportRequest {
  type: "equity-report" | "policy-document" | "metrics-snapshot" | "workflow-summary";
  title: string;
  sections: ReportSection[];
  metadata?: {
    author?: string;
    date?: string;
    program?: string;
    division?: string;
  };
}

/**
 * Export a report as a print-ready HTML document.
 * When the Edge Function is available, it generates a styled HTML report server-side.
 * Falls back to client-side generation otherwise.
 *
 * The returned HTML includes @page print styles optimized for PDF output via
 * browser print (Ctrl+P / Cmd+P).
 */
export async function exportReport(request: ReportRequest): Promise<void> {
  let html: string;

  if (isSupabaseAvailable() && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke("export-pdf", {
        body: request,
        headers: { Accept: "text/html" },
      });

      if (!error && typeof data === "string") {
        html = data;
      } else {
        console.warn("Edge Function unavailable, using client-side export");
        html = generateReportHtmlLocal(request);
      }
    } catch {
      html = generateReportHtmlLocal(request);
    }
  } else {
    html = generateReportHtmlLocal(request);
  }

  // Open in new window for print-to-PDF
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.addEventListener("load", () => {
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    });
  }

  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Client-side fallback: generates the same styled HTML as the Edge Function
 */
function generateReportHtmlLocal(data: ReportRequest): string {
  const date = data.metadata?.date || new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const author = data.metadata?.author || "One DSD Equity Platform";

  const sectionsHtml = data.sections
    .map(section => {
      let html = `<div class="section"><h2>${escapeHtml(section.heading)}</h2>`;
      html += `<p>${escapeHtml(section.content).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;

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
@page { size: letter; margin: 1in; }
body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; max-width: 7.5in; margin: 0 auto; padding: 20px; }
.header { border-bottom: 3px solid #003865; padding-bottom: 16px; margin-bottom: 24px; }
.header .org { font-size: 10pt; color: #003865; text-transform: uppercase; letter-spacing: 1px; }
.header h1 { font-size: 22pt; color: #003865; margin: 8px 0; }
.header .meta { font-size: 9pt; color: #666; }
h2 { font-size: 14pt; color: #003865; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-top: 28px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
th { background: #003865; color: white; padding: 8px 12px; text-align: left; }
td { padding: 8px 12px; border-bottom: 1px solid #e8e8e8; }
tr:nth-child(even) td { background: #f8f8f8; }
.footer { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 12px; font-size: 8pt; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="header">
<div class="org">Minnesota Department of Human Services</div>
<div class="org">Disability Services Division</div>
<h1>${escapeHtml(data.title)}</h1>
<div class="meta">One DSD Equity Program &middot; ${escapeHtml(author)} &middot; ${escapeHtml(date)}</div>
</div>
${sectionsHtml}
<div class="footer">Minnesota DHS &middot; Disability Services Division &middot; Generated ${escapeHtml(date)}<br>Confidential &mdash; For Internal Use Only</div>
</body>
</html>`;
}
