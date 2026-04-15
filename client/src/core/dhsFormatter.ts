// DHS Writing Guidelines Formatter
// Auto-reformats text to comply with MN DHS standards:
// - 8th grade reading level max
// - Person-first language
// - Asset-based framing (no deficit language)
// - Active voice
// - Acronyms defined on first use
// - No ableist language

export interface DHSFormatResult {
  original: string;
  formatted: string;
  changes: string[];
  gradeLevel: number;
  acronymsFound: string[];
  readingLevelPass: boolean;
}

const PERSON_FIRST_SWAPS: [RegExp, string][] = [
  [/\bthe disabled\b/gi, "people with disabilities"],
  [/\bdisabled people\b/gi, "people with disabilities"],
  [/\bdisabled persons?\b/gi, "people with disabilities"],
  [/\bhandicapped\b/gi, "people with disabilities"],
  [/\bthe mentally ill\b/gi, "people with mental health conditions"],
  [/\bmentally ill people\b/gi, "people with mental health conditions"],
  [/\bthe blind\b/gi, "people who are blind"],
  [/\bthe deaf\b/gi, "people who are Deaf or hard of hearing"],
  [/\bwheelchair[- ]bound\b/gi, "person who uses a wheelchair"],
  [/\bconfined to a wheelchair\b/gi, "uses a wheelchair"],
  [/\bsuffers from\b/gi, "has"],
  [/\bafflicted with\b/gi, "has"],
  [/\bvictim of\b/gi, "person affected by"],
];

const DEFICIT_LANGUAGE_SWAPS: [RegExp, string][] = [
  [/\bat-risk\b/gi, "underresourced"],
  [/\bunderserved\b/gi, "historically underresourced"],
  [/\bhard to reach\b/gi, "communities not yet reached"],
  [/\bdisadvantaged\b/gi, "communities facing systemic barriers"],
  [/\bvulnerable\b/gi, "people who experience systemic barriers"],
  [/\bminority\b/gi, "communities of color"],
  [/\bnon-white\b/gi, "communities of color"],
];

const ABLEIST_SWAPS: [RegExp, string][] = [
  [/\bretarded\b/gi, "[removed — use person-first language]"],
  [/\bcrippled\b/gi, "person with a mobility disability"],
  [/\binvalid\b/gi, "person with a disability"],
  [/\blame\b/gi, "weak"],
];

function estimateGradeLevel(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (words.length === 0 || sentences.length === 0) return 0;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const avgSentenceLength = words.length / sentences.length;
  // Simplified Flesch-Kincaid approximation
  return Math.max(1, Math.round(0.39 * avgSentenceLength + 11.8 * (avgWordLength / 4.7) - 15.59));
}

function findUndefinedAcronyms(text: string): string[] {
  const acronyms = [...new Set(text.match(/\b[A-Z]{2,6}\b/g) || [])];
  return acronyms.filter(a => {
    // Check if it's defined in parentheses nearby
    const pattern = new RegExp(`\\(${a}\\)`, "i");
    return !pattern.test(text);
  });
}

export function formatToDHS(text: string): DHSFormatResult {
  const changes: string[] = [];
  let formatted = text;

  // Person-first language
  for (const [pattern, replacement] of PERSON_FIRST_SWAPS) {
    if (pattern.test(formatted)) {
      changes.push(`Person-first: replaced "${formatted.match(pattern)?.[0]}" with "${replacement}"`);
      formatted = formatted.replace(pattern, replacement);
    }
  }

  // Deficit language
  for (const [pattern, replacement] of DEFICIT_LANGUAGE_SWAPS) {
    if (pattern.test(formatted)) {
      changes.push(`Asset-based: replaced "${formatted.match(pattern)?.[0]}" with "${replacement}"`);
      formatted = formatted.replace(pattern, replacement);
    }
  }

  // Ableist language
  for (const [pattern, replacement] of ABLEIST_SWAPS) {
    if (pattern.test(formatted)) {
      changes.push(`Ableist language removed: "${formatted.match(pattern)?.[0]}"`);
      formatted = formatted.replace(pattern, replacement);
    }
  }

  const gradeLevel = estimateGradeLevel(formatted);
  const acronymsFound = findUndefinedAcronyms(formatted);

  if (acronymsFound.length > 0) {
    changes.push(`Undefined acronyms: ${acronymsFound.join(", ")} — define on first use`);
  }

  if (gradeLevel > 8) {
    changes.push(`Reading level is grade ${gradeLevel} — target is grade 8 or below. Simplify sentences and use shorter words.`);
  }

  return {
    original: text,
    formatted,
    changes,
    gradeLevel,
    acronymsFound,
    readingLevelPass: gradeLevel <= 8,
  };
}
