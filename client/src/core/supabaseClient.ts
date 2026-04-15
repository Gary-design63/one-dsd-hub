// One DSD Equity Platform - Supabase Client
// Centralized database client for all platform data operations

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.warn(
    "VITE_SUPABASE_URL is not set. Database features will be unavailable. " +
    "Add VITE_SUPABASE_URL to your .env file to enable persistence."
  );
}

if (!supabaseAnonKey) {
  console.warn(
    "VITE_SUPABASE_ANON_KEY is not set. Database features will be unavailable. " +
    "Add VITE_SUPABASE_ANON_KEY to your .env file to enable persistence."
  );
}

// Create client - gracefully handle missing config
let _supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        "x-application-name": "one-dsd-equity-platform"
      }
    }
  });
}

export const supabase = _supabase;

export function isSupabaseAvailable(): boolean {
  return _supabase !== null;
}

// Database table names
export const DB_TABLES = {
  AGENTS: "agents",
  AUDIT_LOG: "audit_log",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  TRAINING_COURSES: "training_courses",
  TRAINING_COMPLETIONS: "training_completions",
  OPERATIONAL_GOALS: "operational_goals",
  COMMUNITIES: "communities",
  COMMUNITY_ASSESSMENTS: "community_assessments",
  SNIFF_CHECK_RESULTS: "sniff_check_results",
  USER_PROFILES: "user_profiles",
  EQUITY_METRICS: "equity_metrics",
  POLICY_DOCUMENTS: "policy_documents",
  WAIVER_SNAPSHOTS: "waiver_snapshots"
} as const;

// Generic typed query helper
export async function dbQuery<T>(
  tableName: string,
  query: (table: ReturnType<SupabaseClient["from"]>) => Promise<{ data: T | null; error: Error | null }>
): Promise<T | null> {
  if (!_supabase) {
    console.warn(`Supabase not available. Cannot query ${tableName}.`);
    return null;
  }

  const { data, error } = await query(_supabase.from(tableName));

  if (error) {
    console.error(`Database error on ${tableName}:`, error);
    throw error;
  }

  return data;
}

// Audit logging helper
export async function logAuditEntry(entry: {
  agentId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  userId?: string;
}): Promise<void> {
  if (!_supabase) return;

  const { error } = await _supabase.from(DB_TABLES.AUDIT_LOG).insert({
    agent_id: entry.agentId,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    details: entry.details,
    user_id: entry.userId,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error("Failed to write audit log:", error);
  }
}

// Conversation storage
export async function saveConversation(conversation: {
  agentId: string;
  userId?: string;
  title: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  if (!_supabase) return null;

  const { data, error } = await _supabase
    .from(DB_TABLES.CONVERSATIONS)
    .insert({
      agent_id: conversation.agentId,
      user_id: conversation.userId,
      title: conversation.title,
      messages: conversation.messages,
      metadata: conversation.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save conversation:", error);
    return null;
  }

  return data?.id || null;
}

// Sniff check result storage
export async function saveSniffCheckResult(result: {
  checkId: string;
  agentId: string;
  level: string;
  overallStatus: string;
  passCount: number;
  failCount: number;
  warningCount: number;
  reviewCount: number;
  canProceed: boolean;
  summary: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  if (!_supabase) return;

  const { error } = await _supabase.from(DB_TABLES.SNIFF_CHECK_RESULTS).insert({
    check_id: result.checkId,
    agent_id: result.agentId,
    level: result.level,
    overall_status: result.overallStatus,
    pass_count: result.passCount,
    fail_count: result.failCount,
    warning_count: result.warningCount,
    review_count: result.reviewCount,
    can_proceed: result.canProceed,
    summary: result.summary,
    details: result.details,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error("Failed to save sniff check result:", error);
  }
}

// Equity metrics snapshot
export async function saveEquityMetric(metric: {
  metricName: string;
  metricValue: number;
  unit: string;
  populationGroup?: string;
  geographicScope?: string;
  programArea?: string;
  dataSource?: string;
  reportingPeriod?: string;
  notes?: string;
}): Promise<void> {
  if (!_supabase) return;

  const { error } = await _supabase.from(DB_TABLES.EQUITY_METRICS).insert({
    metric_name: metric.metricName,
    metric_value: metric.metricValue,
    unit: metric.unit,
    population_group: metric.populationGroup,
    geographic_scope: metric.geographicScope,
    program_area: metric.programArea,
    data_source: metric.dataSource,
    reporting_period: metric.reportingPeriod,
    notes: metric.notes,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error("Failed to save equity metric:", error);
  }
}

export default supabase;
