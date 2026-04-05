export type ResumeBlock = {
  id: string;
  resume_id: string;
  type: string;
  title: string;
  sort_order: number;
  content: Record<string, unknown>;
  is_visible: boolean;
  updated_at: string;
};

export type ResumeDesignSettings = {
  margins: { top: number; bottom: number; left: number; right: number };
  sectionSpacing: number;
  fontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  accentColor: string;
};

export const DEFAULT_DESIGN_SETTINGS: ResumeDesignSettings = {
  margins: { top: 40, bottom: 40, left: 40, right: 40 },
  sectionSpacing: 16,
  fontFamily: "Inter",
  baseFontSize: 12,
  lineHeight: 1.5,
  accentColor: "#111827",
};

export type Resume = {
  id: string;
  title: string;
  status: string;
  data?: Record<string, unknown> | null;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type TemplateId =
  | "modern-clean"
  | "ivy-league"
  | "minimal"
  | "timeline"
  | "compact"
  | "executive"
  | "elegant"
  | "creative"
  | "contemporary"
  | "professional";

export type TemplateLayout = "single" | "two-column";

export type HeadingStyle =
  | "underline"       // bottom border line
  | "bold"            // bold uppercase, no border
  | "caps-spaced"     // uppercase, wide letter-spacing, thin rule
  | "colored-bg"      // colored background strip behind text
  | "bordered-left";  // thick left border accent

export type TemplateStyles = {
  id: TemplateId;
  name: string;
  description: string;
  headingFont: string;
  bodyFont: string;
  headerAlignment: "center" | "left";
  contactLayout: "inline" | "column" | "two-column";
  headingStyle: HeadingStyle;
  skillsStyle: "tags" | "list" | "bars" | "inline";
  accentColor: string;

  /* Layout */
  layout: TemplateLayout;
  sidebarPosition?: "left" | "right";
  sidebarWidth?: number;            // percentage (e.g. 35 = 35%)
  sidebarBlocks?: string[];         // block types that go in sidebar
  sidebarBgColor?: string;          // optional colored sidebar background
  sidebarTextColor?: string;        // text color for sidebar (for dark backgrounds)
  headerSpan?: "full" | "main";     // does header span full width or just main area

  /* Visual extras */
  headerBgColor?: string;           // colored header background (creative template)
  headerTextColor?: string;         // header text color override
  showTimeline?: boolean;           // show timeline dots/lines for experience/education
  compactMode?: boolean;            // tighter spacing throughout
  dividerStyle?: "line" | "none" | "dots";  // section dividers
};

/* ── User Plans & Feature Gating ── */

export type UserPlan = "free" | "pro" | "enterprise";

export type PlanFeatures = {
  maxResumes: number;
  pdfWatermark: boolean;
  aiRewritesPerMonth: number;     // 0 for free, 50 for pro, unlimited for enterprise
  aiSummaryGeneration: boolean;
  aiBulletRewrite: boolean;
  aiJobTailoring: boolean;        // tailor resume to job description
  aiAtsScoring: boolean;
  customTemplates: boolean;
  allTemplates: boolean;          // free gets 3, pro gets all
  pdfExport: boolean;
  variantResumes: boolean;
};

export const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    maxResumes: 1,
    pdfWatermark: true,
    aiRewritesPerMonth: 0,
    aiSummaryGeneration: false,
    aiBulletRewrite: false,
    aiJobTailoring: false,
    aiAtsScoring: false,
    customTemplates: false,
    allTemplates: false,
    pdfExport: true,
    variantResumes: false,
  },
  pro: {
    maxResumes: 10,
    pdfWatermark: false,
    aiRewritesPerMonth: 50,
    aiSummaryGeneration: true,
    aiBulletRewrite: true,
    aiJobTailoring: true,
    aiAtsScoring: true,
    customTemplates: false,
    allTemplates: true,
    pdfExport: true,
    variantResumes: true,
  },
  enterprise: {
    maxResumes: -1, // unlimited
    pdfWatermark: false,
    aiRewritesPerMonth: -1, // unlimited
    aiSummaryGeneration: true,
    aiBulletRewrite: true,
    aiJobTailoring: true,
    aiAtsScoring: true,
    customTemplates: true,
    allTemplates: true,
    pdfExport: true,
    variantResumes: true,
  },
};

/* ── AI Feature Types ── */

export type AiEditableField =
  | "summary"             // Profile summary rewrite
  | "experience.bullets"  // Bullet point enhancement
  | "experience.description" // Job description rewrite
  | "skills.suggest"      // Suggest skills from job description
  | "cover-letter";       // Generate cover letter (future)

export type AiAction = {
  id: string;
  field: AiEditableField;
  label: string;                  // CTA text e.g. "Rewrite with AI"
  description: string;            // tooltip
  requiredPlan: UserPlan;         // minimum plan to use this
  endpoint: string;               // API route e.g. "/api/ai/rewrite-bullets"
};

/** Registry of all AI actions — UI reads this to render CTAs */
export const AI_ACTIONS: AiAction[] = [
  {
    id: "rewrite-summary",
    field: "summary",
    label: "Rewrite with AI",
    description: "AI rewrites your summary to be more compelling and ATS-optimized",
    requiredPlan: "pro",
    endpoint: "/api/ai/rewrite-summary",
  },
  {
    id: "enhance-bullets",
    field: "experience.bullets",
    label: "Enhance with AI",
    description: "AI improves bullet points with action verbs and quantified results",
    requiredPlan: "pro",
    endpoint: "/api/ai/enhance-bullets",
  },
  {
    id: "rewrite-description",
    field: "experience.description",
    label: "Rewrite with AI",
    description: "AI rewrites job description to highlight achievements",
    requiredPlan: "pro",
    endpoint: "/api/ai/rewrite-description",
  },
  {
    id: "suggest-skills",
    field: "skills.suggest",
    label: "Suggest skills",
    description: "AI suggests relevant skills based on your experience and target role",
    requiredPlan: "pro",
    endpoint: "/api/ai/suggest-skills",
  },
];

/* ── Wizard ── */

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export type WizardStep = {
  id: StepId;
  label: string;
  description: string;
  blockTypes: string[];
};
