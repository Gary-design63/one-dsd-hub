// One DSD Equity and Inclusion Agentic Operations Platform
// Complete TypeScript Type Definitions

// ============================================================
// CORE PLATFORM TYPES
// ============================================================

export type AgentStatus = "active" | "idle" | "processing" | "error" | "disabled";
export type AgentCategory =
  | "policy"
  | "data"
  | "training"
  | "community"
  | "operations"
  | "communications"
  | "compliance"
  | "employment"
  | "waiver";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatus;
  capabilities: string[];
  metaSkillsDomains: string[];
  systemPromptAddendum?: string;
  icon?: string;
  color?: string;
  lastActive?: string;
  messageCount?: number;
  successRate?: number;
  averageResponseTime?: number; // seconds
  tags?: string[];
  isPublic?: boolean;
  requiredPermissions?: string[];
}

export interface AgentConversation {
  id: string;
  agentId: string;
  userId?: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  sniffCheckResults?: SniffCheckResult[];
  isStarred?: boolean;
  tags?: string[];
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentId?: string;
  metadata?: {
    inputTokens?: number;
    outputTokens?: number;
    model?: string;
    sniffCheckPassed?: boolean;
    sniffCheckLevel?: SniffCheckLevel;
  };
}

// ============================================================
// SNIFF CHECK TYPES
// ============================================================

export type SniffCheckLevel = "L1" | "L2" | "L3";
export type SniffCheckStatus = "PASS" | "FAIL" | "WARNING" | "REVIEW_REQUIRED";

export interface SniffCheckCriterionResult {
  criterionId: string;
  status: SniffCheckStatus;
  message: string;
  evidence?: string;
  recommendation?: string;
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

export interface SniffCheckContext {
  agentId: string;
  outputType: "draft" | "policy" | "data" | "communication" | "training" | "report";
  audience: "executive" | "staff" | "community" | "provider" | "legislature" | "internal";
  contentType: "text" | "data" | "document" | "email" | "presentation";
  metadata?: Record<string, unknown>;
}

// ============================================================
// COMMUNITY AND POPULATION TYPES
// ============================================================

export type CommunityType =
  | "black_african_american"
  | "indigenous_native_american"
  | "latinx_hispanic"
  | "asian_pacific_islander"
  | "east_african"
  | "hmong"
  | "somali"
  | "rural_greater_mn"
  | "lgbtq"
  | "other_bipoc"
  | "general";

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  description: string;
  geographicScope: "statewide" | "metro" | "greater_mn" | "county" | "regional";
  primaryLanguages: string[];
  estimatedPopulationWithDisabilities?: number;
  keyOrganizations?: CommunityOrganization[];
  keyContacts?: CommunityContact[];
  equityPriorities?: string[];
  serviceAccessChallenges?: string[];
  engagementHistory?: EngagementRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityOrganization {
  id: string;
  name: string;
  type: "advocacy" | "provider" | "cultural" | "faith" | "government" | "education" | "employment";
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  primaryContact?: string;
  languages?: string[];
  servicesOffered?: string[];
  notes?: string;
}

export interface CommunityContact {
  id: string;
  name: string;
  role: string;
  organization?: string;
  email?: string;
  phone?: string;
  languages?: string[];
  notes?: string;
  preferredContactMethod?: "email" | "phone" | "text" | "in_person";
}

export interface EngagementRecord {
  id: string;
  date: string;
  type: "meeting" | "survey" | "focus_group" | "listening_session" | "advisory_panel" | "community_event";
  description: string;
  attendees?: number;
  keyThemes?: string[];
  actionItems?: string[];
  followUpDate?: string;
  notes?: string;
}

export interface CommunityAssessment {
  id: string;
  communityId: string;
  assessmentDate: string;
  assessor: string;
  serviceAccessScore: number; // 1-10
  languageAccessScore: number; // 1-10
  providerDiversityScore: number; // 1-10
  waiterListImpact: "low" | "medium" | "high" | "critical";
  employmentOutcomeGap: number; // percentage points below state average
  keyFindings: string[];
  recommendations: string[];
  dataQuality: "high" | "medium" | "low";
  nextReviewDate: string;
}

// ============================================================
// AUDIT LOG TYPES
// ============================================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  status: "success" | "failure" | "partial";
  errorMessage?: string;
}

export type AuditAction =
  | "agent_invoked"
  | "document_generated"
  | "policy_drafted"
  | "training_completed"
  | "data_queried"
  | "sniff_check_run"
  | "community_record_updated"
  | "goal_updated"
  | "report_generated"
  | "email_drafted"
  | "system_config_changed"
  | "user_login"
  | "user_logout"
  | "export_data"
  | "import_data";

// ============================================================
// TRAINING AND EDUCATION TYPES
// ============================================================

export type CourseCategory =
  | "equity_foundations"
  | "disability_justice"
  | "waiver_programs"
  | "policy_compliance"
  | "cultural_responsiveness"
  | "employment_first"
  | "olmstead"
  | "data_literacy"
  | "community_engagement"
  | "leadership";

export type CourseLevel = "foundational" | "intermediate" | "advanced" | "expert";
export type CourseAudience = "all_staff" | "supervisors" | "leadership" | "providers" | "community" | "county";
export type CourseStatus = "draft" | "review" | "published" | "archived" | "under_revision";
export type CourseFormat = "online" | "in_person" | "hybrid" | "self_paced" | "live_virtual";

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  audience: CourseAudience[];
  format: CourseFormat;
  status: CourseStatus;
  estimatedDuration: number; // minutes
  learningObjectives: string[];
  topics: CourseTopicModule[];
  prerequisites?: string[];
  metaSkillsAddressed: string[];
  accessibilityFeatures: string[];
  availableLanguages: string[];
  certificationOffered: boolean;
  certificationName?: string;
  ceCredits?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId?: string;
  reviewerId?: string;
  enrollmentCount?: number;
  completionRate?: number;
  averageRating?: number;
  tags?: string[];
}

export interface CourseTopicModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  contentType: "video" | "reading" | "interactive" | "assessment" | "discussion" | "reflection";
  content?: string;
  resources?: CourseResource[];
  assessmentQuestions?: AssessmentQuestion[];
  order: number;
}

export interface CourseResource {
  id: string;
  title: string;
  type: "document" | "video" | "link" | "infographic" | "audio";
  url?: string;
  description?: string;
  language?: string;
  accessibilityNotes?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "reflection";
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  equityRelevance?: string;
}

export interface TrainingCompletion {
  id: string;
  courseId: string;
  userId: string;
  completedAt: string;
  score?: number;
  timeSpent: number; // minutes
  certificateIssued: boolean;
  certificateId?: string;
  assessmentResults?: Record<string, unknown>;
  feedback?: string;
  rating?: number; // 1-5
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  courses: string[]; // course IDs in order
  targetAudience: CourseAudience[];
  estimatedDuration: number; // total minutes
  requiredForRole?: string[];
  tags?: string[];
}

// ============================================================
// OPERATIONAL GOALS TYPES
// ============================================================

export type GoalStatus = "not_started" | "in_progress" | "on_track" | "at_risk" | "completed" | "cancelled";
export type GoalPriority = "critical" | "high" | "medium" | "low";
export type GoalCategory =
  | "equity_access"
  | "workforce_development"
  | "policy_change"
  | "data_transparency"
  | "community_voice"
  | "olmstead"
  | "employment_first"
  | "language_access"
  | "provider_diversity"
  | "training";

export interface OperationalGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  owner: string;
  collaborators?: string[];
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progressPercent: number; // 0-100
  keyResults: KeyResult[];
  alignedStrategicPriority?: string;
  relatedCommunities?: string[]; // community IDs
  equityImpact?: string;
  resources?: GoalResource[];
  dependencies?: string[]; // goal IDs
  blockers?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface KeyResult {
  id: string;
  description: string;
  metric: string;
  baseline?: number;
  target: number;
  current: number;
  unit: string;
  dueDate?: string;
  status: GoalStatus;
  notes?: string;
}

export interface GoalResource {
  id: string;
  type: "document" | "link" | "contact" | "budget" | "tool";
  title: string;
  url?: string;
  description?: string;
}

// ============================================================
// EQUITY METRICS TYPES
// ============================================================

export interface EquityMetric {
  id: string;
  metricName: string;
  metricValue: number;
  unit: string;
  populationGroup?: string;
  geographicScope?: string;
  programArea?: string;
  dataSource?: string;
  reportingPeriod?: string;
  notes?: string;
  trend?: "improving" | "stable" | "worsening" | "unknown";
  benchmark?: number;
  benchmarkDescription?: string;
  createdAt: string;
}

export interface DisparityReport {
  id: string;
  title: string;
  generatedAt: string;
  programArea: string;
  reportingPeriod: string;
  overallDisparityIndex: number;
  populationBreakdowns: PopulationBreakdown[];
  keyFindings: string[];
  recommendations: string[];
  dataQuality: "high" | "medium" | "low";
  methodology?: string;
}

export interface PopulationBreakdown {
  population: string;
  value: number;
  stateAverage: number;
  disparityRatio: number;
  sampleSize?: number;
  confidenceInterval?: string;
  trend?: "improving" | "stable" | "worsening";
}

// ============================================================
// WAIVER AND SERVICES TYPES
// ============================================================

export type WaiverType = "CADI" | "DD" | "BI" | "EW" | "AC" | "MA-EPD";
export type WaiverStatus = "active" | "waitlist" | "pending" | "closed" | "suspended";

export interface WaiverParticipant {
  id: string;
  waiverType: WaiverType;
  status: WaiverStatus;
  enrollmentDate?: string;
  waitlistDate?: string;
  county: string;
  ageGroup: "0-17" | "18-64" | "65+";
  primaryDisabilityCategory?: string;
  racialEthnicIdentity?: string;
  primaryLanguage?: string;
  isRural?: boolean;
  annualBudget?: number;
  servicesReceived?: string[];
}

export interface WaiverWaitlistSnapshot {
  id: string;
  snapshotDate: string;
  waiverType: WaiverType;
  totalOnWaitlist: number;
  averageWaitDays?: number;
  byCounty?: Record<string, number>;
  byRaceEthnicity?: Record<string, number>;
  byAgeGroup?: Record<string, number>;
  notes?: string;
}

// ============================================================
// EMPLOYMENT FIRST TYPES
// ============================================================

export type EmploymentOutcome =
  | "competitive_integrated"
  | "supported_employment"
  | "customized_employment"
  | "self_employment"
  | "day_services"
  | "unemployed_seeking"
  | "unemployed_not_seeking"
  | "retired"
  | "student";

export interface EmploymentRecord {
  id: string;
  participantId?: string;
  county: string;
  waiverType: WaiverType;
  outcome: EmploymentOutcome;
  hoursPerWeek?: number;
  hourlyWage?: number;
  employerType?: "private" | "public" | "nonprofit" | "self";
  supportsUsed?: string[];
  jobCoachingHours?: number;
  racialEthnicIdentity?: string;
  primaryLanguage?: string;
  isRural?: boolean;
  date: string;
}

export interface EmploymentFirstGoal {
  id: string;
  programYear: string;
  targetPercent: number; // % of working-age with competitive integrated employment
  currentPercent: number;
  byPopulation?: Record<string, number>;
  status: GoalStatus;
  notes?: string;
}

// ============================================================
// PROVIDER TYPES
// ============================================================

export type ProviderType =
  | "residential"
  | "day_services"
  | "employment"
  | "personal_care"
  | "case_management"
  | "behavior_support"
  | "crisis"
  | "transportation"
  | "respite"
  | "assistive_technology";

export type ProviderStatus = "licensed" | "provisional" | "suspended" | "revoked" | "pending";

export interface ServiceProvider {
  id: string;
  name: string;
  type: ProviderType[];
  status: ProviderStatus;
  county: string;
  geographicServiceArea: string[];
  licensedCapacity?: number;
  currentEnrollment?: number;
  languages?: string[];
  culturalSpecializations?: string[];
  ownershipDiversity?: {
    bipocOwned: boolean;
    womanOwned: boolean;
    veteranOwned: boolean;
    disabilityOwned: boolean;
  };
  waiverContracts?: WaiverType[];
  qualityRating?: number; // 1-5
  maltreatmentRate?: number;
  complianceScore?: number;
  employeeWageAverage?: number;
  turnoverRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DOCUMENT AND POLICY TYPES
// ============================================================

export type DocumentType =
  | "policy_brief"
  | "legislative_testimony"
  | "guidance_document"
  | "training_material"
  | "equity_analysis"
  | "community_report"
  | "executive_memo"
  | "data_report"
  | "meeting_summary"
  | "correspondence"
  | "strategic_plan";

export type DocumentStatus = "draft" | "review" | "approved" | "published" | "archived";

export interface PolicyDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  content?: string;
  summary?: string;
  audience: string[];
  authorId?: string;
  reviewerId?: string;
  programArea?: string;
  relatedStatutes?: string[];
  relatedPolicies?: string[];
  equityImplications?: string;
  community?: string[];
  languagesAvailable?: string[];
  accessibilityFormats?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expirationDate?: string;
  tags?: string[];
  sniffCheckStatus?: SniffCheckStatus;
  sniffCheckResultId?: string;
}

// ============================================================
// USER AND AUTH TYPES
// ============================================================

export type UserRole =
  | "super_admin"
  | "equity_consultant"
  | "program_director"
  | "policy_analyst"
  | "training_coordinator"
  | "data_analyst"
  | "provider"
  | "community_partner"
  | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  title?: string;
  county?: string;
  phone?: string;
  languages?: string[];
  permittedAgents?: string[];
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UserPreferences {
  defaultAudience?: string;
  defaultLanguage?: string;
  notificationsEnabled?: boolean;
  emailDigest?: boolean;
  theme?: "light" | "dark" | "system";
  dashboardWidgets?: string[];
}

// ============================================================
// DASHBOARD AND ANALYTICS TYPES
// ============================================================

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  trendPeriod?: string;
  status?: "good" | "warning" | "critical" | "neutral";
  description?: string;
  lastUpdated?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  populationGroup?: string;
  notes?: string;
}

export interface EquityGapData {
  category: string;
  stateAverage: number;
  populationValue: number;
  gap: number;
  population: string;
  trendDirection?: "improving" | "worsening" | "stable";
}

// ============================================================
// OLMSTEAD PLAN TYPES
// ============================================================

export interface OlmsteadProgressReport {
  id: string;
  reportingPeriod: string;
  communityTransitions: {
    fromNursingFacility: number;
    fromICFDD: number;
    fromOther: number;
    total: number;
  };
  communityLiving: {
    inCommunity: number;
    inInstitution: number;
    percentCommunity: number;
  };
  employment: {
    competitiveIntegrated: number;
    percentEmployed: number;
    disparityByRace: Record<string, number>;
  };
  housing: {
    withHousingSupports: number;
    homelessRisk: number;
    newHousingOpportunities: number;
  };
  waitlistStatus: Record<WaiverType, WaiverWaitlistSnapshot>;
  overallProgress: "on_track" | "behind" | "ahead" | "mixed";
  keyAccomplishments: string[];
  challenges: string[];
  nextStepsPriorities: string[];
  generatedAt: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | "goal_update"
  | "sniff_check_failure"
  | "training_complete"
  | "document_ready"
  | "equity_alert"
  | "system_alert"
  | "deadline_reminder"
  | "community_update";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  userId?: string;
  agentId?: string;
  relatedResourceId?: string;
  relatedResourceType?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters?: Record<string, unknown>;
  highlights?: Record<string, string[]>;
}
