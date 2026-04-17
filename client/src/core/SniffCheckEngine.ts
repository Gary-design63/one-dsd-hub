// One DSD Equity Platform - Sniff Check Engine
// Three-tier quality assurance system for all agent outputs
// L1: Rapid/Automated, L2: Equity Review, L3: Expert Validation

import { PRIMARY_DIRECTIVE } from "./PrimaryDirective";

export type SniffCheckLevel = "L1" | "L2" | "L3";
export type SniffCheckStatus = "PASS" | "FAIL" | "WARNING" | "REVIEW_REQUIRED";

export interface SniffCheckCriterion {
  id: string;
  level: SniffCheckLevel;
  category: string;
  name: string;
  description: string;
  checkFn?: (content: string, context?: SniffCheckContext) => SniffCheckCriterionResult;
}

export interface SniffCheckCriterionResult {
  criterionId: string;
  status: SniffCheckStatus;
  message: string;
  evidence?: string;
  recommendation?: string;
}

export interface SniffCheckContext {
  agentId: string;
  outputType: "draft" | "policy" | "data" | "communication" | "training" | "report";
  audience: "executive" | "staff" | "community" | "provider" | "legislature" | "internal";
  contentType: "text" | "data" | "document" | "email" | "presentation";
  metadata?: Record<string, unknown>;
}

export interface SniffCheckResult {
  id: string;
  timestamp: string;
  level: SniffCheckLevel;
  overallStatus: SniffCheckStatus;
  agentId: string;
  context: SniffCheckContext;
  criteriaResults: SniffCheckCriterionResult[];
  passCount: number;
  failCount: number;
  warningCount: number;
  reviewCount: number;
  summary: string;
  blockingIssues: string[];
  recommendations: string[];
  canProceed: boolean;
}

// ============================================================
// L1 CRITERIA: Rapid Automated Checks
// Run on every output before delivery
// ============================================================
export const L1_CRITERIA: SniffCheckCriterion[] = [
  {
    id: "L1-001",
    level: "L1",
    category: "Primary Directive",
    name: "Force Multiplier Alignment",
    description: "Output multiplies consultant capacity, does not create overhead",
    checkFn: (content) => {
      const problemKeywords = ["you need to", "please do", "your task", "i cannot", "you should manually"];
      const hasOverheadCreation = problemKeywords.some(kw => content.toLowerCase().includes(kw));
      return {
        criterionId: "L1-001",
        status: hasOverheadCreation ? "WARNING" : "PASS",
        message: hasOverheadCreation
          ? "Output may be creating tasks rather than absorbing work"
          : "Output appears to multiply rather than divide capacity",
        recommendation: hasOverheadCreation
          ? "Reframe to provide complete deliverables rather than instructions for the consultant to follow"
          : undefined
      };
    }
  },
  {
    id: "L1-002",
    level: "L1",
    category: "Primary Directive",
    name: "Draft-Ready Output Standard",
    description: "Output must be draft-ready or deployment-ready",
    checkFn: (content) => {
      const incompleteness = ["[placeholder]", "[insert]", "[tbd]", "[fill in]", "TODO:", "...", "[your name]"];
      const hasPlaceholders = incompleteness.some(ph => content.toLowerCase().includes(ph.toLowerCase()));
      return {
        criterionId: "L1-002",
        status: hasPlaceholders ? "FAIL" : "PASS",
        message: hasPlaceholders
          ? "Output contains placeholders or incomplete sections"
          : "Output appears complete and ready for use",
        recommendation: hasPlaceholders
          ? "Complete all sections before delivery; never deliver outputs with placeholders"
          : undefined
      };
    }
  },
  {
    id: "L1-003",
    level: "L1",
    category: "Problem-Solution Pairing",
    name: "Solution Attachment Verification",
    description: "No problem surfaced without attached proposed solution",
    checkFn: (content) => {
      const problemWords = ["problem", "issue", "concern", "challenge", "barrier", "risk"];
      const solutionWords = ["recommend", "suggest", "propose", "solution", "address", "mitigate", "action"];
      const hasProblem = problemWords.some(w => content.toLowerCase().includes(w));
      const hasSolution = solutionWords.some(w => content.toLowerCase().includes(w));

      if (hasProblem && !hasSolution) {
        return {
          criterionId: "L1-003",
          status: "FAIL",
          message: "Problem identified but no proposed solution attached",
          recommendation: "Every problem statement must be accompanied by at least one proposed solution or next step"
        };
      }
      return {
        criterionId: "L1-003",
        status: "PASS",
        message: "Problem-solution pairing appears adequate"
      };
    }
  },
  {
    id: "L1-004",
    level: "L1",
    category: "Content Quality",
    name: "Minimum Content Length",
    description: "Output meets minimum substantive length for its type",
    checkFn: (content, context) => {
      const minLengths: Record<string, number> = {
        draft: 200,
        policy: 300,
        data: 100,
        communication: 50,
        training: 300,
        report: 400
      };
      const outputType = context?.outputType || "draft";
      const minLength = minLengths[outputType] || 200;
      const actualLength = content.trim().length;

      return {
        criterionId: "L1-004",
        status: actualLength >= minLength ? "PASS" : "WARNING",
        message: actualLength >= minLength
          ? `Content length (${actualLength} chars) meets minimum for ${outputType}`
          : `Content length (${actualLength} chars) may be insufficient for ${outputType} (min: ${minLength})`,
        recommendation: actualLength < minLength
          ? "Expand content to ensure completeness and usefulness"
          : undefined
      };
    }
  },
  {
    id: "L1-005",
    level: "L1",
    category: "Language Quality",
    name: "Ableist Language Detection",
    description: "Output free from ableist or stigmatizing language",
    checkFn: (content) => {
      const ableistTerms = [
        "suffers from", "afflicted with", "confined to a wheelchair", "wheelchair-bound",
        "mentally retarded", "retarded", "crippled", "invalid", "suffers with",
        "normal people", "able-bodied as the norm", "handicapped person"
      ];
      const found = ableistTerms.filter(term => content.toLowerCase().includes(term.toLowerCase()));
      return {
        criterionId: "L1-005",
        status: found.length > 0 ? "FAIL" : "PASS",
        message: found.length > 0
          ? `Ableist language detected: ${found.join(", ")}`
          : "No ableist language detected",
        evidence: found.length > 0 ? found.join(", ") : undefined,
        recommendation: found.length > 0
          ? "Replace ableist terms with disability justice-aligned language. Use identity-first or person-first language based on community preference."
          : undefined
      };
    }
  },
  {
    id: "L1-006",
    level: "L1",
    category: "Language Quality",
    name: "Racial Slur Detection",
    description: "Output contains no racial slurs or explicitly derogatory terms",
    checkFn: (content) => {
      // Check for obviously harmful content patterns without listing slurs
      const harmPatterns = ["racial hierarchy", "inherent inferiority", "inferior race"];
      const found = harmPatterns.filter(p => content.toLowerCase().includes(p.toLowerCase()));
      return {
        criterionId: "L1-006",
        status: found.length > 0 ? "FAIL" : "PASS",
        message: found.length > 0
          ? "Potentially harmful racial content detected"
          : "No explicitly harmful racial content detected at L1 scan",
        recommendation: found.length > 0
          ? "Remove harmful content immediately; refer to L2 equity review"
          : undefined
      };
    }
  },
  {
    id: "L1-007",
    level: "L1",
    category: "Accuracy",
    name: "Minnesota-Specific Accuracy Markers",
    description: "MN-specific claims reference real programs and statutes",
    checkFn: (content) => {
      const mnPrograms = ["cadi", "dd waiver", "brain injury waiver", "elderly waiver", "cbsm", "mmis", "olmstead"];
      const hasMnContent = mnPrograms.some(p => content.toLowerCase().includes(p));
      if (!hasMnContent) {
        return {
          criterionId: "L1-007",
          status: "PASS",
          message: "No MN-specific program references requiring accuracy check"
        };
      }
      // If MN programs are mentioned, flag for human verification
      return {
        criterionId: "L1-007",
        status: "WARNING",
        message: "Minnesota-specific program references detected - verify accuracy",
        recommendation: "Verify all MN program names, statutes, and policy references against current CBSM and DHS publications"
      };
    }
  },
  {
    id: "L1-008",
    level: "L1",
    category: "Format",
    name: "Audience Alignment Check",
    description: "Output format appropriate for intended audience",
    checkFn: (content, context) => {
      const audience = context?.audience || "staff";
      const technicalTermDensity = (content.match(/\b(MMIS|HCBS|ICF|DSP|PCA|CBSM|CMS|DD|BI|CADI)\b/g) || []).length;
      const contentLength = content.length;
      const termDensityRatio = contentLength > 0 ? (technicalTermDensity / contentLength) * 1000 : 0;

      if (audience === "community" && termDensityRatio > 5) {
        return {
          criterionId: "L1-008",
          status: "WARNING",
          message: `High acronym/technical term density (${termDensityRatio.toFixed(1)} per 1000 chars) for community audience`,
          recommendation: "Expand acronyms and replace jargon with plain language for community audiences"
        };
      }
      return {
        criterionId: "L1-008",
        status: "PASS",
        message: `Format appears appropriate for ${audience} audience`
      };
    }
  }
];

// ============================================================
// L2 CRITERIA: Equity Review Checks
// Run when equity implications are significant
// ============================================================
export const L2_CRITERIA: SniffCheckCriterion[] = [
  {
    id: "L2-001",
    level: "L2",
    category: "Equity Analysis",
    name: "Structural Analysis Present",
    description: "Analysis addresses structural/systemic factors, not just individual",
    checkFn: (content) => {
      const structuralTerms = ["structural", "systemic", "institutional", "policy", "system", "historical", "root cause"];
      const individualTerms = ["individual", "personal", "family", "behavior", "choice"];
      const hasStructural = structuralTerms.some(t => content.toLowerCase().includes(t));
      const hasIndividualOnly = !hasStructural && individualTerms.some(t => content.toLowerCase().includes(t));

      return {
        criterionId: "L2-001",
        status: hasStructural ? "PASS" : hasIndividualOnly ? "WARNING" : "REVIEW_REQUIRED",
        message: hasStructural
          ? "Structural factors addressed in analysis"
          : "Analysis may focus on individual factors without structural context",
        recommendation: !hasStructural
          ? "Add structural and systemic context to any analysis of disparities or challenges"
          : undefined
      };
    }
  },
  {
    id: "L2-002",
    level: "L2",
    category: "Equity Analysis",
    name: "Intersectionality Consideration",
    description: "Output accounts for compounding effects of multiple identities",
    checkFn: (content) => {
      const intersectionalTerms = ["intersect", "multiple", "compounding", "overlap", "combined", "race and disability", "black and disabled"];
      const hasIntersectional = intersectionalTerms.some(t => content.toLowerCase().includes(t));

      return {
        criterionId: "L2-002",
        status: hasIntersectional ? "PASS" : "WARNING",
        message: hasIntersectional
          ? "Intersectional considerations present"
          : "Output may not account for intersecting identities",
        recommendation: !hasIntersectional
          ? "Consider how race, ethnicity, gender, geography, and disability intersect for people affected by this output"
          : undefined
      };
    }
  },
  {
    id: "L2-003",
    level: "L2",
    category: "Community Voice",
    name: "Community Perspective Integration",
    description: "Community voice and lived experience represented",
    checkFn: (content) => {
      const communityTerms = ["community", "lived experience", "people with disabilities", "self-advocate", "family", "participant"];
      const hasCommunityVoice = communityTerms.filter(t => content.toLowerCase().includes(t)).length >= 2;

      return {
        criterionId: "L2-003",
        status: hasCommunityVoice ? "PASS" : "WARNING",
        message: hasCommunityVoice
          ? "Community perspectives appear represented"
          : "Community voice may be underrepresented",
        recommendation: !hasCommunityVoice
          ? "Explicitly incorporate community perspective, lived experience, or self-advocate input"
          : undefined
      };
    }
  },
  {
    id: "L2-004",
    level: "L2",
    category: "Data Equity",
    name: "Disaggregated Data Usage",
    description: "Data presented disaggregated by race, ethnicity, and other equity variables",
    checkFn: (content) => {
      const disaggTerms = ["by race", "by ethnicity", "disparit", "disaggregat", "black", "indigenous", "latinx", "hmong", "somali", "asian"];
      const hasDisagg = disaggTerms.some(t => content.toLowerCase().includes(t));
      const hasDataMention = content.toLowerCase().includes("data") || content.toLowerCase().includes("percent") || content.toLowerCase().includes("%");

      if (hasDataMention && !hasDisagg) {
        return {
          criterionId: "L2-004",
          status: "WARNING",
          message: "Data referenced but may not be disaggregated by equity variables",
          recommendation: "Disaggregate all data by race, ethnicity, geography, and other equity variables"
        };
      }
      return {
        criterionId: "L2-004",
        status: "PASS",
        message: hasDisagg ? "Disaggregated data or equity variables present" : "No data references requiring disaggregation check"
      };
    }
  },
  {
    id: "L2-005",
    level: "L2",
    category: "Language Justice",
    name: "Language Access Consideration",
    description: "Language access needs identified where applicable",
    checkFn: (content) => {
      const communityOutreachTerms = ["outreach", "community engagement", "communication", "inform", "notify", "letter"];
      const languageAccessTerms = ["language", "translation", "interpretation", "bilingual", "somali", "spanish", "hmong"];
      const hasCommunityOutreach = communityOutreachTerms.some(t => content.toLowerCase().includes(t));
      const hasLanguageAccess = languageAccessTerms.some(t => content.toLowerCase().includes(t));

      if (hasCommunityOutreach && !hasLanguageAccess) {
        return {
          criterionId: "L2-005",
          status: "WARNING",
          message: "Community outreach content without explicit language access consideration",
          recommendation: "Address language access needs for Minnesota's top languages (Spanish, Somali, Hmong, Vietnamese, Oromo, Arabic)"
        };
      }
      return {
        criterionId: "L2-005",
        status: "PASS",
        message: "Language access consideration adequate or not applicable"
      };
    }
  },
  {
    id: "L2-006",
    level: "L2",
    category: "Olmstead Alignment",
    name: "Olmstead Plan Consistency",
    description: "Policy recommendations consistent with Minnesota Olmstead obligations",
    checkFn: (content) => {
      const institutionalTerms = ["institution", "facility", "congregate", "nursing home"];
      const communityTerms = ["community", "integrated", "independent", "home"];
      const hasInstitutional = institutionalTerms.some(t => content.toLowerCase().includes(t));
      const hasCommunity = communityTerms.some(t => content.toLowerCase().includes(t));

      if (hasInstitutional && !hasCommunity) {
        return {
          criterionId: "L2-006",
          status: "WARNING",
          message: "Content references institutional settings without community integration context",
          recommendation: "Ensure Olmstead and HCBS principles (most integrated setting) are reflected in all policy content"
        };
      }
      return {
        criterionId: "L2-006",
        status: "PASS",
        message: "Olmstead alignment appears adequate"
      };
    }
  },
  {
    id: "L2-007",
    level: "L2",
    category: "Harm Prevention",
    name: "Unintended Harm Assessment",
    description: "Output assessed for potential unintended harm to marginalized communities",
    checkFn: (content) => {
      const harmRisks = ["cut", "reduce", "eliminate", "restrict", "limit access", "tighten eligibility"];
      const mitigationTerms = ["with community input", "with equity review", "staged implementation", "disparity impact analysis"];
      const hasHarmRisk = harmRisks.some(t => content.toLowerCase().includes(t));
      const hasMitigation = mitigationTerms.some(t => content.toLowerCase().includes(t));

      if (hasHarmRisk && !hasMitigation) {
        return {
          criterionId: "L2-007",
          status: "WARNING",
          message: "Content suggests service changes without explicit equity harm mitigation",
          recommendation: "Any service reductions or eligibility changes require equity impact analysis and community input before implementation"
        };
      }
      return {
        criterionId: "L2-007",
        status: "PASS",
        message: "No obvious unmitigated harm risk detected"
      };
    }
  }
];

// ============================================================
// L3 CRITERIA: Expert Validation Checks
// Run for high-stakes outputs: legislation, major policy, public reports
// ============================================================
export const L3_CRITERIA: SniffCheckCriterion[] = [
  {
    id: "L3-001",
    level: "L3",
    category: "Legal Compliance",
    name: "ADA and Disability Rights Compliance",
    description: "Content consistent with ADA, Rehab Act, and disability rights law",
    checkFn: () => ({
      criterionId: "L3-001",
      status: "REVIEW_REQUIRED",
      message: "L3 legal review requires qualified human reviewer",
      recommendation: "Submit to disability rights attorney or DHS legal counsel for review before deployment"
    })
  },
  {
    id: "L3-002",
    level: "L3",
    category: "Legal Compliance",
    name: "Minnesota Statute Accuracy",
    description: "All statutory citations accurate and current",
    checkFn: () => ({
      criterionId: "L3-002",
      status: "REVIEW_REQUIRED",
      message: "L3 statutory review requires human expert verification",
      recommendation: "Verify all MN statute citations against current Revisor of Statutes; confirm no superseded provisions"
    })
  },
  {
    id: "L3-003",
    level: "L3",
    category: "Community Validation",
    name: "Community Review Completed",
    description: "Affected communities have reviewed and provided input on content",
    checkFn: () => ({
      criterionId: "L3-003",
      status: "REVIEW_REQUIRED",
      message: "Community review must be confirmed by human coordinator",
      recommendation: "Document community engagement process, who was included, input received, and how it was incorporated"
    })
  },
  {
    id: "L3-004",
    level: "L3",
    category: "Data Integrity",
    name: "Data Sources Verified",
    description: "All data citations traceable to authoritative sources",
    checkFn: () => ({
      criterionId: "L3-004",
      status: "REVIEW_REQUIRED",
      message: "L3 data verification requires human expert review of source documentation",
      recommendation: "Verify all statistics against primary DHS/CMS data sources; ensure data currency and validity"
    })
  },
  {
    id: "L3-005",
    level: "L3",
    category: "Equity Impact",
    name: "Equity Impact Analysis Complete",
    description: "Full equity impact analysis conducted and documented",
    checkFn: () => ({
      criterionId: "L3-005",
      status: "REVIEW_REQUIRED",
      message: "Equity impact analysis requires structured human review process",
      recommendation: "Complete DSD Equity Impact Analysis template; present findings to equity leadership before policy finalization"
    })
  },
  {
    id: "L3-006",
    level: "L3",
    category: "Disability Justice",
    name: "Nothing About Us Without Us",
    description: "People with disabilities from affected communities led or co-led development",
    checkFn: () => ({
      criterionId: "L3-006",
      status: "REVIEW_REQUIRED",
      message: "Disability leadership participation requires human confirmation",
      recommendation: "Document participation of people with disabilities from affected communities in development and decision-making"
    })
  }
];

// ============================================================
// SNIFF CHECK ENGINE
// ============================================================

function generateCheckId(): string {
  return `SC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function determineCriteriaToRun(level: SniffCheckLevel): SniffCheckCriterion[] {
  switch (level) {
    case "L1":
      return L1_CRITERIA;
    case "L2":
      return [...L1_CRITERIA, ...L2_CRITERIA];
    case "L3":
      return [...L1_CRITERIA, ...L2_CRITERIA, ...L3_CRITERIA];
    default:
      return L1_CRITERIA;
  }
}

export function runSniffCheck(
  content: string,
  level: SniffCheckLevel,
  context: SniffCheckContext
): SniffCheckResult {
  const criteria = determineCriteriaToRun(level);
  const criteriaResults: SniffCheckCriterionResult[] = [];

  for (const criterion of criteria) {
    if (criterion.checkFn) {
      const result = criterion.checkFn(content, context);
      criteriaResults.push(result);
    } else {
      criteriaResults.push({
        criterionId: criterion.id,
        status: "REVIEW_REQUIRED",
        message: `${criterion.name}: Manual review required`,
        recommendation: criterion.description
      });
    }
  }

  const passCount = criteriaResults.filter(r => r.status === "PASS").length;
  const failCount = criteriaResults.filter(r => r.status === "FAIL").length;
  const warningCount = criteriaResults.filter(r => r.status === "WARNING").length;
  const reviewCount = criteriaResults.filter(r => r.status === "REVIEW_REQUIRED").length;

  const blockingIssues = criteriaResults
    .filter(r => r.status === "FAIL")
    .map(r => r.message);

  const recommendations = criteriaResults
    .filter(r => r.recommendation)
    .map(r => r.recommendation as string);

  let overallStatus: SniffCheckStatus = "PASS";
  if (failCount > 0) overallStatus = "FAIL";
  else if (reviewCount > 0) overallStatus = "REVIEW_REQUIRED";
  else if (warningCount > 0) overallStatus = "WARNING";

  const canProceed = failCount === 0;

  const summary = `Sniff Check ${level} Complete: ${passCount} PASS, ${failCount} FAIL, ${warningCount} WARNING, ${reviewCount} REVIEW_REQUIRED. ${canProceed ? "Output can proceed." : "BLOCKING ISSUES - output cannot proceed until resolved."}`;

  return {
    id: generateCheckId(),
    timestamp: new Date().toISOString(),
    level,
    overallStatus,
    agentId: context.agentId,
    context,
    criteriaResults,
    passCount,
    failCount,
    warningCount,
    reviewCount,
    summary,
    blockingIssues,
    recommendations,
    canProceed
  };
}

export function runL1Check(content: string, context: SniffCheckContext): SniffCheckResult {
  return runSniffCheck(content, "L1", context);
}

export function runL2Check(content: string, context: SniffCheckContext): SniffCheckResult {
  return runSniffCheck(content, "L2", context);
}

export function runL3Check(content: string, context: SniffCheckContext): SniffCheckResult {
  return runSniffCheck(content, "L3", context);
}

export function getUniversalChecks(): SniffCheckCriterion[] {
  return L1_CRITERIA.filter(c =>
    ["L1-001", "L1-002", "L1-003", "L1-005"].includes(c.id)
  );
}

export function formatSniffCheckReport(result: SniffCheckResult): string {
  const lines = [
    `=== SNIFF CHECK REPORT (${result.level}) ===`,
    `ID: ${result.id}`,
    `Timestamp: ${result.timestamp}`,
    `Agent: ${result.agentId}`,
    `Overall Status: ${result.overallStatus}`,
    `Can Proceed: ${result.canProceed ? "YES" : "NO - RESOLVE FAILURES FIRST"}`,
    "",
    `RESULTS: ${result.passCount} Pass | ${result.failCount} Fail | ${result.warningCount} Warning | ${result.reviewCount} Review Required`,
    ""
  ];

  if (result.blockingIssues.length > 0) {
    lines.push("BLOCKING ISSUES (must resolve before proceeding):");
    result.blockingIssues.forEach(issue => lines.push(`  - ${issue}`));
    lines.push("");
  }

  if (result.recommendations.length > 0) {
    lines.push("RECOMMENDATIONS:");
    result.recommendations.forEach(rec => lines.push(`  - ${rec}`));
    lines.push("");
  }

  lines.push("DETAIL:");
  result.criteriaResults.forEach(cr => {
    lines.push(`  [${cr.status}] ${cr.criterionId}: ${cr.message}`);
  });

  lines.push("", `Primary Directive: "${PRIMARY_DIRECTIVE.text}"`);
  lines.push("===================================");

  return lines.join("\n");
}
