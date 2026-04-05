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

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export type WizardStep = {
  id: StepId;
  label: string;
  description: string;
  blockTypes: string[];
};
