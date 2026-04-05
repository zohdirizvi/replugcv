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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Map CSS font-family string to the registered @react-pdf family name */
function pdfFontFamily(cssFontFamily: string): string {
  // Serif fonts → Georgia (EB Garamond registered under "Georgia")
  const serifFonts = ["Georgia", "Playfair Display", "Merriweather", "Lora", "EB Garamond"];
  if (serifFonts.some((f) => cssFontFamily.includes(f)) || cssFontFamily.includes("serif")) {
    return "Georgia";
  }
  // TODO: Register more Google Fonts (Roboto, Open Sans, Lato, Montserrat,
  // Poppins, Raleway, Source Sans Pro, Nunito, Work Sans) and map them here.
  // For now all sans-serif fonts fall back to Inter.
  return "Inter";
}

/** Round to one decimal place */
function scaledSize(base: number, multiplier: number): number {
  return Math.round(base * multiplier * 10) / 10;
}

function hasContent(block: ResumeBlock): boolean {
  const c = block.content as Record<string, unknown>;
  if (!c) return false;

  if (block.type === "header") {
    return !!((c.name as string) || (c.title as string) || (c.summary as string));
  }
  if (block.type === "contact") {
    return CONTACT_FIELDS_LIST.some((f) => !!(c[f.key] as string));
  }
  if (block.type === "summary" || block.type === "custom") {
    return !!(c.text as string);
  }
  // items-based blocks
  const items = c.items as unknown[] | undefined;
  return !!items && items.length > 0;
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/* ------------------------------------------------------------------ */

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

  if (style.headingStyle === "bold") {
    return (
      <View style={{ marginBottom: 4 }}>
        <Text
          style={{
            fontSize: scaledSize(baseFontSize, 0.85),
            fontFamily: headingFont,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: accentColor,
            paddingBottom: 2,
          }}
        >
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 4 }}>
      <Text
        style={{
          fontSize: scaledSize(baseFontSize, 0.85),
          fontFamily: headingFont,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
          color: accentColor,
          paddingBottom: 2,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared props for block renderers                                   */
/* ------------------------------------------------------------------ */

type BlockRendererProps = {
  block: ResumeBlock;
  style: TemplateStyles;
  accentColor: string;
  baseFontSize: number;
  lineHeight: number;
  sectionSpacing: number;
  resolvedFont: string;
};

/* ------------------------------------------------------------------ */
/*  Block renderers                                                    */
/* ------------------------------------------------------------------ */

function HeaderBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const name = (c.name as string) || "";
  const title = (c.title as string) || "";
  const summary = (c.summary as string) || "";
  const headingFont = pdfFontFamily(style.headingFont);

  return (
    <View style={{ marginBottom: sectionSpacing, textAlign: style.headerAlignment }}>
      {name ? (
        <Text
          style={{
            fontSize: scaledSize(baseFontSize, 1.8),
            fontFamily: headingFont,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.2,
          }}
        >
          {name}
        </Text>
      ) : null}
      {title ? (
        <Text style={{ fontSize: scaledSize(baseFontSize, 1.1), fontFamily: resolvedFont, color: accentColor, marginTop: 1 }}>
          {title}
        </Text>
      ) : null}
      {summary ? (
        <Text
          style={{
            fontSize: scaledSize(baseFontSize, 1),
            fontFamily: resolvedFont,
            color: "#4B5563",
            marginTop: 6,
            lineHeight,
            ...(style.headerAlignment === "center"
              ? { maxWidth: 336, marginLeft: "auto", marginRight: "auto" }
              : {}),
          }}
        >
          {summary}
        </Text>
      ) : null}
    </View>
  );
}

function ContactBlock({ block, style, accentColor, baseFontSize, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const fields = CONTACT_FIELDS_LIST.filter((f) => !!(c[f.key] as string));

  const isColumn = style.contactLayout === "column";

  return (
    <View
      style={{
        marginBottom: sectionSpacing,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 8,
        flexDirection: isColumn ? "column" : "row",
        flexWrap: isColumn ? undefined : "wrap",
        justifyContent: isColumn ? undefined : "center",
        gap: isColumn ? 2 : undefined,
        columnGap: isColumn ? undefined : 12,
        rowGap: isColumn ? undefined : 2,
      }}
    >
      {fields.map((f) => (
        <Text key={f.key} style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563" }}>
          <Text style={{ color: accentColor }}>{"\u2022 "}</Text>
          {c[f.key] as string}
        </Text>
      ))}
    </View>
  );
}

function SummaryBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const text = (c.text as string) || "";

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title="Summary" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#374151", lineHeight }}>
        {text}
      </Text>
    </View>
  );
}

function ExperienceBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title="Experience" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 6 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flexDirection: "row", flexShrink: 1 }}>
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: "#111827" }}>
                {(item.role as string) || "Role"}
              </Text>
              {(item.company as string) ? (
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: accentColor }}>
                  {" at "}
                  {item.company as string}
                </Text>
              ) : null}
            </View>
            <Text style={{ fontSize: scaledSize(baseFontSize, 0.8), fontFamily: resolvedFont, color: "#9CA3AF", flexShrink: 0, marginLeft: 6 }}>
              {(item.startDate as string) || ""}
              {(item.startDate as string) && (item.endDate as string) ? " - " : ""}
              {(item.endDate as string) || ""}
            </Text>
          </View>
          {(item.description as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563", marginTop: 1, lineHeight }}>
              {item.description as string}
            </Text>
          ) : null}
          {((item.bullets as string[]) || []).length > 0
            ? ((item.bullets as string[]) || []).map((b: string, j: number) => (
                <Text
                  key={j}
                  style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563", marginTop: 2, paddingLeft: 12, lineHeight }}
                >
                  {"•  "}
                  {b}
                </Text>
              ))
            : null}
        </View>
      ))}
    </View>
  );
}

function EducationBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title="Education" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 5 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flexDirection: "row", flexShrink: 1 }}>
              <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: "#111827" }}>
                {(item.degree as string) || "Degree"}
              </Text>
              {(item.field as string) ? (
                <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563" }}>
                  {" in "}
                  {item.field as string}
                </Text>
              ) : null}
            </View>
            <Text style={{ fontSize: scaledSize(baseFontSize, 0.8), fontFamily: resolvedFont, color: "#9CA3AF", flexShrink: 0, marginLeft: 6 }}>
              {(item.startYear as string) || ""}
              {(item.startYear as string) && (item.endYear as string) ? " - " : ""}
              {(item.endYear as string) || ""}
            </Text>
          </View>
          {(item.school as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: accentColor }}>
              {item.school as string}
            </Text>
          ) : null}
          {(item.gpa as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 0.8), fontFamily: resolvedFont, color: "#9CA3AF" }}>
              GPA: {item.gpa as string}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SkillsBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as string[]) || [];

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {style.skillsStyle === "tags" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {items.map((skill, i) => (
            <Text
              key={i}
              style={{
                fontSize: scaledSize(baseFontSize, 0.75),
                fontFamily: resolvedFont,
                fontWeight: 500,
                color: "#374151",
                backgroundColor: "#F3F4F6",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              {skill}
            </Text>
          ))}
        </View>
      ) : (
        <View>
          {items.map((skill, i) => (
            <Text
              key={i}
              style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#374151", paddingLeft: 12, lineHeight }}
            >
              {"•  "}
              {skill}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function ProjectsBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title="Projects" style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 5 : 0 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: "#111827" }}>
              {(item.name as string) || "Project"}
            </Text>
            {(item.url as string) ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 0.8), fontFamily: resolvedFont, color: "#9CA3AF", marginLeft: 4 }}>
                ({item.url as string})
              </Text>
            ) : null}
          </View>
          {(item.description as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563", marginTop: 1, lineHeight }}>
              {item.description as string}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function GenericItemsBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const items = (c.items as Array<Record<string, unknown>>) || [];

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 5 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, fontWeight: 600, color: "#111827" }}>
              {(item.title as string) || block.title}
            </Text>
            {(item.date as string) ? (
              <Text style={{ fontSize: scaledSize(baseFontSize, 0.8), fontFamily: resolvedFont, color: "#9CA3AF", flexShrink: 0, marginLeft: 6 }}>
                {item.date as string}
              </Text>
            ) : null}
          </View>
          {(item.description as string) ? (
            <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#4B5563", marginTop: 1, lineHeight }}>
              {item.description as string}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function CustomBlock({ block, style, accentColor, baseFontSize, lineHeight, sectionSpacing, resolvedFont }: BlockRendererProps) {
  const c = block.content as Record<string, unknown>;
  const text = (c.text as string) || "";

  return (
    <View style={{ marginBottom: sectionSpacing }}>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} baseFontSize={baseFontSize} />
      {text ? (
        <Text style={{ fontSize: scaledSize(baseFontSize, 1), fontFamily: resolvedFont, color: "#374151", lineHeight }}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Block dispatcher                                                   */
/* ------------------------------------------------------------------ */

function PdfBlock({ block, rendererProps }: { block: ResumeBlock; rendererProps: Omit<BlockRendererProps, "block"> }) {
  const props: BlockRendererProps = { block, ...rendererProps };

  switch (block.type) {
    case "header":
      return <HeaderBlock {...props} />;
    case "contact":
      return <ContactBlock {...props} />;
    case "summary":
      return <SummaryBlock {...props} />;
    case "experience":
      return <ExperienceBlock {...props} />;
    case "education":
      return <EducationBlock {...props} />;
    case "skills":
    case "languages":
    case "interests":
      return <SkillsBlock {...props} />;
    case "projects":
      return <ProjectsBlock {...props} />;
    case "certifications":
    case "awards":
    case "volunteer":
    case "publications":
      return <GenericItemsBlock {...props} />;
    default:
      return <CustomBlock {...props} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Main document                                                      */
/* ------------------------------------------------------------------ */

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
          color: "#111827",
        }}
      >
        {visibleBlocks.map((block) => (
          <PdfBlock key={block.id} block={block} rendererProps={rendererProps} />
        ))}

        {userPlan === "free" && (
          <Text
            style={{
              position: "absolute",
              bottom: 16,
              right: 20,
              fontSize: 8,
              color: "#9CA3AF",
              opacity: 0.5,
            }}
            fixed
          >
            Built with ReplugCV
          </Text>
        )}
      </Page>
    </Document>
  );
}
