import {
  Document,
  Page,
  View,
  Text,
} from "@react-pdf/renderer";
import type { ResumeBlock, TemplateStyles, ResumeDesignSettings } from "../types";
import { DEFAULT_DESIGN_SETTINGS } from "../types";
import { CONTACT_FIELDS_LIST } from "../constants";
import { registerFonts } from "./register-fonts";

registerFonts();

/* ── Constants ── */
const BODY_COLOR = "#717180";

/* ── Helpers ── */

function pdfFontFamily(cssFontFamily: string): string {
  const serifFonts = ["Georgia", "Playfair Display", "Merriweather", "Lora", "EB Garamond"];
  if (serifFonts.some((f) => cssFontFamily.includes(f)) || cssFontFamily.includes("serif")) {
    return "Georgia";
  }
  return "Inter";
}

function scaledSize(base: number, multiplier: number): number {
  return Math.round(base * multiplier * 10) / 10;
}

function hasContent(block: ResumeBlock): boolean {
  const c = block.content as Record<string, unknown>;
  if (!c) return false;
  if (block.type === "header") return !!((c.name as string) || (c.title as string));
  if (block.type === "contact") return CONTACT_FIELDS_LIST.some((f) => !!(c[f.key] as string));
  if (block.type === "summary" || block.type === "custom") return !!(c.text as string);
  const items = c.items as unknown[] | undefined;
  return !!items && items.length > 0;
}

/** Strip basic HTML tags from inline-edited content */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/* ── Section Heading (matches preview exactly) ── */

function SectionHeading({
  title,
  style,
  accentColor,
  baseFontSize,
}: {
  title: string;
  style: TemplateStyles;
  accentColor: string;
  baseFontSize: number;
}) {
  const headingFont = pdfFontFamily(style.headingFont);

  if (style.headingStyle === "caps-spaced") {
    return (
      <View style={{ marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB", paddingBottom: 3 }}>
        <Text style={{ fontSize: scaledSize(baseFontSize, 0.75), fontFamily: headingFont, fontWeight: 500, textTransform: "uppercase", letterSpacing: 2, color: accentColor }}>
          {title}
        </Text>
      </View>
    );
  }

  if (style.headingStyle === "colored-bg") {
    return (
      <View style={{ marginBottom: 4, backgroundColor: accentColor, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2 }}>
        <Text style={{ fontSize: scaledSize(baseFontSize, 0.75), fontFamily: headingFont, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#FFFFFF" }}>
          {title}
        </Text>
      </View>
    );
  }

  if (style.headingStyle === "bordered-left") {
    return (
      <View style={{ marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 3, height: 14, backgroundColor: accentColor, borderRadius: 2 }} />
        <Text style={{ fontSize: scaledSize(baseFontSize, 0.85), fontFamily: headingFont, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accentColor }}>
          {title}
        </Text>
      </View>
    );
  }

  if (style.headingStyle === "bold") {
    return (
      <View style={{ marginBottom: 4 }}>
        <Text style={{ fontSize: scaledSize(baseFontSize, 0.85), fontFamily: headingFont, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accentColor }}>
          {title}
        </Text>
      </View>
    );
  }

  /* Default: underline — simple semibold accent text (matches Figma) */
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={{ fontSize: scaledSize(baseFontSize, 1.15), fontFamily: headingFont, fontWeight: 600, color: accentColor }}>
        {title}
      </Text>
    </View>
  );
}

/* ── Section Divider ── */

function SectionDivider({ spacing }: { spacing: number }) {
  return (
    <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB", marginTop: spacing * 0.5, marginBottom: spacing * 0.5 }} />
  );
}

/* ── Block renderer props ── */

type BlockRendererProps = {
  block: ResumeBlock;
  style: TemplateStyles;
  accentColor: string;
  baseFontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  resolvedFont: string;
};

/* ── HEADER ── */

function HeaderBlock({ block, accentColor, baseFontSize, resolvedFont, style }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const name = (c.name as string) || "";
  const title = (c.title as string) || "";

  return (
    <View style={{ textAlign: style.headerAlignment }}>
      {name ? (
        <Text style={{ fontSize: scaledSize(baseFontSize, 1.65), fontFamily: resolvedFont, fontWeight: 600, color: accentColor, lineHeight: 1.2 }}>
          {name}
        </Text>
      ) : null}
      {title ? (
        <Text style={{ fontSize: scaledSize(baseFontSize, 1.15), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR, marginTop: 2 }}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

/* ── CONTACT ── */

function ContactBlock({ block, style, accentColor, baseFontSize, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const fields = CONTACT_FIELDS_LIST.filter((f) => !!(c[f.key] as string));
  const isColumn = style.contactLayout === "column";
  const isTwoCol = style.contactLayout === "two-column";

  return (
    <View>
      <View
        style={{
          flexDirection: isColumn ? "column" : "row",
          flexWrap: isColumn ? undefined : "wrap",
          justifyContent: isColumn || isTwoCol ? undefined : (style.headerAlignment === "center" ? "center" : "flex-start"),
          gap: isColumn ? 2 : undefined,
          columnGap: isColumn ? undefined : 10,
          rowGap: isColumn ? undefined : 2,
        }}
      >
        {fields.map((f) => (
          <Text key={f.key} style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR }}>
            <Text style={{ color: accentColor }}>{"\u2022 "}</Text>
            {c[f.key] as string}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ── SUMMARY ── */

function SummaryBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const text = stripHtml((c.text as string) || "");

  return (
    <View>
      <SectionHeading title="Summary" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, lineHeight }}>
        {text}
      </Text>
    </View>
  );
}

/* ── EXPERIENCE (flat layout: role+company LEFT, date RIGHT) ── */

function ExperienceBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View>
      <SectionHeading title="Experience" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => {
        const role = (item.role as string) || "";
        const company = (item.company as string) || "";
        const location = (item.location as string) || "";
        const startDate = (item.startDate as string) || "";
        const endDate = (item.endDate as string) || "";
        const description = stripHtml((item.description as string) || "");
        const bullets = (item.bullets as string[]) || [];
        const caseStudyUrl = (item.caseStudyUrl as string) || "";

        return (
          <View key={i} style={{ marginBottom: i < items.length - 1 ? 10 : 0 }}>
            {/* Row: role+company LEFT, date RIGHT */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flexShrink: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: BODY_COLOR }}>
                  {role}{role && company ? ", " : ""}{company}
                </Text>
                {location ? (
                  <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR }}>
                    {location}
                  </Text>
                ) : null}
              </View>
              <View style={{ flexShrink: 0, alignItems: "flex-end" }}>
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR }}>
                  {startDate}{startDate && endDate ? " - " : ""}{endDate}
                </Text>
                {caseStudyUrl ? (
                  <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 500, color: accentColor }}>
                    Read Case study
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Description */}
            {description ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, marginTop: 3, lineHeight }}>
                {description}
              </Text>
            ) : null}

            {/* Bullets */}
            {bullets.length > 0 ? bullets.map((b: string, j: number) => (
              <View key={j} style={{ flexDirection: "row", marginTop: 2, paddingLeft: 4 }}>
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, width: 14 }}>•</Text>
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, flex: 1, lineHeight }}>
                  {stripHtml(b)}
                </Text>
              </View>
            )) : null}
          </View>
        );
      })}
    </View>
  );
}

/* ── EDUCATION (flat layout: degree LEFT, date RIGHT) ── */

function EducationBlock({ block, style, accentColor, baseFontSize, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View>
      <SectionHeading title="Education" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => {
        const degree = (item.degree as string) || "";
        const school = (item.school as string) || "";
        const startYear = (item.startYear as string) || "";
        const endYear = (item.endYear as string) || "";
        const gpa = (item.gpa as string) || "";

        return (
          <View key={i} style={{ marginBottom: i < items.length - 1 ? 8 : 0 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flexShrink: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: BODY_COLOR }}>
                  {degree}
                </Text>
                {school ? (
                  <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR }}>
                    {school}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR, flexShrink: 0 }}>
                {startYear}{startYear && endYear ? " - " : ""}{endYear}
              </Text>
            </View>
            {gpa ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 0.9), fontFamily: resolvedFont, color: BODY_COLOR, marginTop: 1 }}>
                GPA: {gpa}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

/* ── SKILLS (respects skillsStyle from template) ── */

function SkillsBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as string[]) || [];

  const renderSkills = () => {
    if (style.skillsStyle === "tags") {
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {items.map((skill, i) => (
            <Text key={i} style={{ fontSize: scaledSize(baseFontSize, 0.75), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR, backgroundColor: "#F3F4F6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>
              {skill}
            </Text>
          ))}
        </View>
      );
    }

    if (style.skillsStyle === "list") {
      return (
        <View>
          {items.map((skill, i) => (
            <View key={i} style={{ flexDirection: "row", paddingLeft: 4 }}>
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, width: 14 }}>•</Text>
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, flex: 1, lineHeight }}>{skill}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (style.skillsStyle === "bars") {
      return (
        <View style={{ gap: 4 }}>
          {items.map((skill, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: scaledSize(baseFontSize, 0.85), fontFamily: resolvedFont, color: BODY_COLOR, width: 80 }}>{skill}</Text>
              <View style={{ flex: 1, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 }}>
                <View style={{ width: `${70 + (i % 4) * 8}%`, height: 4, backgroundColor: accentColor, borderRadius: 2 }} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    /* Default: inline comma-separated (matches Figma) */
    return (
      <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: BODY_COLOR }}>
        {items.join(", ")}
      </Text>
    );
  };

  return (
    <View>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {renderSkills()}
    </View>
  );
}

/* ── PROJECTS ── */

function ProjectsBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View>
      <SectionHeading title="Projects" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 6 : 0 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: BODY_COLOR }}>
              {(item.name as string) || "Project"}
            </Text>
            {(item.url as string) ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 0.85), fontFamily: resolvedFont, color: accentColor, marginLeft: 4 }}>
                ({item.url as string})
              </Text>
            ) : null}
          </View>
          {(item.description as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, marginTop: 1, lineHeight }}>
              {stripHtml(item.description as string)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/* ── GENERIC (certs, awards, volunteer, publications) ── */

function GenericItemsBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 6 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: BODY_COLOR }}>
              {(item.title as string) || block.title}
            </Text>
            {(item.date as string) ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 500, color: BODY_COLOR, flexShrink: 0, marginLeft: 6 }}>
                {item.date as string}
              </Text>
            ) : null}
          </View>
          {(item.description as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, marginTop: 1, lineHeight }}>
              {stripHtml(item.description as string)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/* ── CUSTOM ── */

function CustomBlock({ block, style, accentColor, baseFontSize, lineHeight, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const text = stripHtml((c.text as string) || "");

  return (
    <View>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {text ? (
        <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: BODY_COLOR, lineHeight }}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

/* ── Block dispatcher ── */

function PdfBlock({ block, rendererProps }: { block: ResumeBlock; rendererProps: Omit<BlockRendererProps, "block"> }) {
  const props: BlockRendererProps = { block, ...rendererProps };

  switch (block.type) {
    case "header": return <HeaderBlock {...props} />;
    case "contact": return <ContactBlock {...props} />;
    case "summary": return <SummaryBlock {...props} />;
    case "experience": return <ExperienceBlock {...props} />;
    case "education": return <EducationBlock {...props} />;
    case "skills":
    case "languages":
    case "interests": return <SkillsBlock {...props} />;
    case "projects": return <ProjectsBlock {...props} />;
    case "certifications":
    case "awards":
    case "volunteer":
    case "publications": return <GenericItemsBlock {...props} />;
    default: return <CustomBlock {...props} />;
  }
}

/* ── Main Document ── */

type PdfDocumentProps = {
  blocks: ResumeBlock[];
  templateStyles: TemplateStyles;
  designSettings: ResumeDesignSettings;
  userPlan: string;
};

export function PdfDocument({ blocks, templateStyles, designSettings, userPlan }: PdfDocumentProps) {
  const ds = designSettings || DEFAULT_DESIGN_SETTINGS;
  const resolvedFont = pdfFontFamily(ds.fontFamily);
  const accentColor = ds.accentColor || templateStyles.accentColor;

  const rendererProps: Omit<BlockRendererProps, "block"> = {
    style: templateStyles,
    accentColor,
    baseFontSize: ds.baseFontSize,
    lineHeight: ds.lineHeight,
    sectionSpacing: ds.sectionSpacing,
    resolvedFont,
  };

  const visibleBlocks = blocks
    .filter((b) => b.is_visible !== false)
    .filter((b) => hasContent(b))
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Document>
      <Page
        size="A4"
        style={{
          paddingTop: ds.margins.top,
          paddingBottom: ds.margins.bottom,
          paddingLeft: ds.margins.left,
          paddingRight: ds.margins.right,
          fontFamily: resolvedFont,
          fontSize: ds.baseFontSize,
          lineHeight: ds.lineHeight,
          color: BODY_COLOR,
        }}
      >
        {visibleBlocks.map((block, idx) => (
          <View key={block.id}>
            <PdfBlock block={block} rendererProps={rendererProps} />
            {/* Section divider after each block except last */}
            {idx < visibleBlocks.length - 1 && (
              <SectionDivider spacing={ds.sectionSpacing} />
            )}
          </View>
        ))}

        {userPlan === "free" && (
          <Text
            style={{ position: "absolute", bottom: 16, right: 20, fontSize: 8, color: "#9CA3AF", opacity: 0.5 }}
            fixed
          >
            Built with ReplugCV
          </Text>
        )}
      </Page>
    </Document>
  );
}
