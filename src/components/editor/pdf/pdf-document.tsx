import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Path,
} from "@react-pdf/renderer";
import type { ResumeBlock, TemplateStyles, ResumeDesignSettings } from "../types";
import { DEFAULT_DESIGN_SETTINGS } from "../types";
import { CONTACT_FIELDS_LIST } from "../constants";
import { registerFonts } from "./register-fonts";

registerFonts();

/* ══════════════════════════════════════════════════════════════════
   Constants & helpers
   ══════════════════════════════════════════════════════════════════ */

const BODY = "#717180";

function fontFor(css: string): string {
  if (["Georgia", "Playfair Display", "Merriweather", "Lora"].some((f) => css.includes(f)) || css.includes("serif")) return "Georgia";
  return "Inter";
}

function sz(base: number, m: number) { return Math.round(base * m * 10) / 10; }

function strip(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function hasContent(b: ResumeBlock) {
  const c = b.content as Record<string, unknown>;
  if (!c) return false;
  if (b.type === "header") return !!((c.name as string) || (c.title as string));
  if (b.type === "contact") return CONTACT_FIELDS_LIST.some((f) => !!(c[f.key] as string));
  if (b.type === "summary" || b.type === "custom") return !!(c.text as string);
  return !!((c.items as unknown[])?.length);
}

/* ══════════════════════════════════════════════════════════════════
   SVG Icons (12×12 viewBox, rendered at contact font size)
   Paths traced from Untitled UI icon set
   ══════════════════════════════════════════════════════════════════ */

function MailIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M2 7l8.165 5.715a2 2 0 002.17 0L22 7M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PhoneIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PinIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M12 13a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M12 22s-8-4.5-8-11a8 8 0 1116 0c0 6.5-8 11-8 11z" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

function GlobeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LinkedInIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const CONTACT_ICON: Record<string, typeof MailIcon> = {
  email: MailIcon,
  phone: PhoneIcon,
  location: PinIcon,
  website: GlobeIcon,
  linkedin: LinkedInIcon,
};

/* ══════════════════════════════════════════════════════════════════
   Section heading — mirrors preview exactly
   ══════════════════════════════════════════════════════════════════ */

type Props = { block: ResumeBlock; style: TemplateStyles; accentColor: string; baseFontSize: number; lineHeight: number; sectionSpacing: number; resolvedFont: string };

function Heading({ title, style, accent, base }: { title: string; style: TemplateStyles; accent: string; base: number }) {
  const hf = fontFor(style.headingFont);
  if (style.headingStyle === "caps-spaced")
    return <View style={{ marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB", paddingBottom: 3 }}><Text style={{ fontSize: sz(base, 0.75), fontFamily: hf, fontWeight: 500, textTransform: "uppercase", letterSpacing: 2, color: accent }}>{title}</Text></View>;
  if (style.headingStyle === "colored-bg")
    return <View style={{ marginBottom: 8, backgroundColor: accent, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2 }}><Text style={{ fontSize: sz(base, 0.75), fontFamily: hf, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#FFF" }}>{title}</Text></View>;
  if (style.headingStyle === "bordered-left")
    return <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 6 }}><View style={{ width: 3, height: 14, backgroundColor: accent, borderRadius: 2 }} /><Text style={{ fontSize: sz(base, 0.85), fontFamily: hf, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: accent }}>{title}</Text></View>;
  if (style.headingStyle === "bold")
    return <View style={{ marginBottom: 8 }}><Text style={{ fontSize: sz(base, 0.85), fontFamily: hf, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: accent }}>{title}</Text></View>;
  // default — semibold accent, no transform (matches Figma)
  return <View style={{ marginBottom: 8 }}><Text style={{ fontSize: sz(base, 1.15), fontFamily: hf, fontWeight: 600, color: accent }}>{title}</Text></View>;
}

function Divider({ sp }: { sp: number }) {
  return <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB", marginTop: sp * 0.6, marginBottom: sp * 0.6 }} />;
}

/* ══════════════════════════════════════════════════════════════════
   Block renderers
   ══════════════════════════════════════════════════════════════════ */

function HeaderBlock({ block, accentColor: ac, baseFontSize: bs, resolvedFont: rf, style: s }: Props) {
  const c = block.content as Record<string, unknown>;
  const name = (c.name as string) || "";
  const title = (c.title as string) || "";
  return (
    <View style={{ textAlign: s.headerAlignment }}>
      {name ? <Text style={{ fontSize: sz(bs, 1.65), fontFamily: rf, fontWeight: 600, color: ac, lineHeight: 1.2 }}>{name}</Text> : null}
      {title ? <Text style={{ fontSize: sz(bs, 1.15), fontFamily: rf, fontWeight: 500, color: BODY, marginTop: 2 }}>{title}</Text> : null}
    </View>
  );
}

function ContactBlock({ block, style: s, accentColor: ac, baseFontSize: bs, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const c = block.content as Record<string, unknown>;
  const fields = CONTACT_FIELDS_LIST.filter((f) => !!(c[f.key] as string));
  const isCol = s.contactLayout === "column";
  const iconSize = sz(bs, 1);

  return (
    <View>
      <View style={{
        flexDirection: isCol ? "column" : "row",
        flexWrap: isCol ? undefined : "wrap",
        justifyContent: isCol ? undefined : (s.headerAlignment === "center" ? "center" : "flex-start"),
        gap: isCol ? 4 : undefined,
        columnGap: isCol ? undefined : 12,
        rowGap: isCol ? undefined : 4,
        marginTop: 6,
      }}>
        {fields.map((f) => {
          const Icon = CONTACT_ICON[f.key] || GlobeIcon;
          return (
            <View key={f.key} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Icon color={ac} size={iconSize} />
              <Text style={{ fontSize: sz(bs, 0.9), fontFamily: rf, fontWeight: 500, color: BODY }}>{c[f.key] as string}</Text>
            </View>
          );
        })}
      </View>
      <Divider sp={sp} />
    </View>
  );
}

function SummaryBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const text = strip((block.content as Record<string, unknown>).text as string || "");
  return (
    <View>
      <Heading title="Summary" style={s} accent={ac} base={bs} />
      <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, lineHeight: lh }}>{text}</Text>
      <Divider sp={sp} />
    </View>
  );
}

function ExperienceBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const items = ((block.content as Record<string, unknown>).items as Array<Record<string, unknown>>) || [];
  return (
    <View>
      <Heading title="Experience" style={s} accent={ac} base={bs} />
      {items.map((it, i) => {
        const role = (it.role as string) || "";
        const company = (it.company as string) || "";
        const loc = (it.location as string) || "";
        const sd = (it.startDate as string) || "";
        const ed = (it.endDate as string) || "";
        const desc = strip((it.description as string) || "");
        const bullets = (it.bullets as string[]) || [];
        const csUrl = (it.caseStudyUrl as string) || "";
        return (
          <View key={i} style={{ marginBottom: i < items.length - 1 ? 10 : 0 }} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, fontWeight: 600, color: BODY }}>{role}{role && company ? ", " : ""}{company}</Text>
                {loc ? <Text style={{ fontSize: sz(bs, 0.9), fontFamily: rf, color: BODY }}>{loc}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: sz(bs, 0.9), fontFamily: rf, fontWeight: 500, color: BODY }}>{sd}{sd && ed ? " - " : ""}{ed}</Text>
                {csUrl ? <Text style={{ fontSize: sz(bs, 0.85), fontFamily: rf, fontWeight: 500, color: ac }}>Read Case study</Text> : null}
              </View>
            </View>
            {desc ? <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, marginTop: 4, lineHeight: lh }}>{desc}</Text> : null}
            {bullets.length > 0 && bullets.map((b, j) => (
              <View key={j} style={{ flexDirection: "row", marginTop: 2, paddingLeft: 4 }}>
                <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, width: 12 }}>•</Text>
                <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, flex: 1, lineHeight: lh }}>{strip(b)}</Text>
              </View>
            ))}
          </View>
        );
      })}
      <Divider sp={sp} />
    </View>
  );
}

function EducationBlock({ block, style: s, accentColor: ac, baseFontSize: bs, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const items = ((block.content as Record<string, unknown>).items as Array<Record<string, unknown>>) || [];
  return (
    <View>
      <Heading title="Education" style={s} accent={ac} base={bs} />
      {items.map((it, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 8 : 0 }} wrap={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, fontWeight: 600, color: BODY }}>{(it.degree as string) || ""}</Text>
              {(it.school as string) ? <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY }}>{it.school as string}</Text> : null}
            </View>
            <Text style={{ fontSize: sz(bs, 0.9), fontFamily: rf, fontWeight: 500, color: BODY }}>
              {(it.startYear as string) || ""}{(it.startYear as string) && (it.endYear as string) ? " - " : ""}{(it.endYear as string) || ""}
            </Text>
          </View>
          {(it.gpa as string) ? <Text style={{ fontSize: sz(bs, 0.85), fontFamily: rf, color: BODY, marginTop: 1 }}>GPA: {it.gpa as string}</Text> : null}
        </View>
      ))}
      <Divider sp={sp} />
    </View>
  );
}

function SkillsBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const items = ((block.content as Record<string, unknown>).items as string[]) || [];

  const content = () => {
    if (s.skillsStyle === "tags")
      return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{items.map((sk, i) => <Text key={i} style={{ fontSize: sz(bs, 0.75), fontFamily: rf, fontWeight: 500, color: BODY, backgroundColor: "#F3F4F6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>{sk}</Text>)}</View>;
    if (s.skillsStyle === "list")
      return <View>{items.map((sk, i) => <View key={i} style={{ flexDirection: "row", paddingLeft: 4 }}><Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, width: 12 }}>•</Text><Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, flex: 1, lineHeight: lh }}>{sk}</Text></View>)}</View>;
    if (s.skillsStyle === "bars")
      return <View style={{ gap: 5 }}>{items.map((sk, i) => <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Text style={{ fontSize: sz(bs, 0.85), fontFamily: rf, color: BODY, width: 80 }}>{sk}</Text><View style={{ flex: 1, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 }}><View style={{ width: `${70 + (i % 4) * 8}%`, height: 4, backgroundColor: ac, borderRadius: 2 }} /></View></View>)}</View>;
    return <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, fontWeight: 600, color: BODY }}>{items.join(", ")}</Text>;
  };

  return <View><Heading title={block.title} style={s} accent={ac} base={bs} />{content()}<Divider sp={sp} /></View>;
}

function ProjectsBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const items = ((block.content as Record<string, unknown>).items as Array<Record<string, unknown>>) || [];
  return (
    <View>
      <Heading title="Projects" style={s} accent={ac} base={bs} />
      {items.map((it, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 6 : 0 }} wrap={false}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, fontWeight: 600, color: BODY }}>{(it.name as string) || ""}</Text>
            {(it.url as string) ? <Text style={{ fontSize: sz(bs, 0.85), fontFamily: rf, color: ac, marginLeft: 4 }}>({it.url as string})</Text> : null}
          </View>
          {(it.description as string) ? <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, marginTop: 2, lineHeight: lh }}>{strip(it.description as string)}</Text> : null}
        </View>
      ))}
      <Divider sp={sp} />
    </View>
  );
}

function GenericBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const items = ((block.content as Record<string, unknown>).items as Array<Record<string, unknown>>) || [];
  return (
    <View>
      <Heading title={block.title} style={s} accent={ac} base={bs} />
      {items.map((it, i) => (
        <View key={i} style={{ marginBottom: i < items.length - 1 ? 6 : 0 }} wrap={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, fontWeight: 600, color: BODY }}>{(it.title as string) || ""}</Text>
            {(it.date as string) ? <Text style={{ fontSize: sz(bs, 0.9), fontFamily: rf, fontWeight: 500, color: BODY }}>{it.date as string}</Text> : null}
          </View>
          {(it.description as string) ? <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, marginTop: 1, lineHeight: lh }}>{strip(it.description as string)}</Text> : null}
        </View>
      ))}
      <Divider sp={sp} />
    </View>
  );
}

function CustomTextBlock({ block, style: s, accentColor: ac, baseFontSize: bs, lineHeight: lh, resolvedFont: rf, sectionSpacing: sp }: Props) {
  const text = strip(((block.content as Record<string, unknown>).text as string) || "");
  return <View><Heading title={block.title} style={s} accent={ac} base={bs} />{text ? <Text style={{ fontSize: sz(bs, 1), fontFamily: rf, color: BODY, lineHeight: lh }}>{text}</Text> : null}<Divider sp={sp} /></View>;
}

/* ══════════════════════════════════════════════════════════════════
   Block dispatcher + divider wrapper
   ══════════════════════════════════════════════════════════════════ */

function RenderBlock({ block, p }: { block: ResumeBlock; p: Omit<Props, "block"> }) {
  const props: Props = { block, ...p };
  switch (block.type) {
    case "header": return <HeaderBlock {...props} />;
    case "contact": return <ContactBlock {...props} />;
    case "summary": return <SummaryBlock {...props} />;
    case "experience": return <ExperienceBlock {...props} />;
    case "education": return <EducationBlock {...props} />;
    case "skills": case "languages": case "interests": return <SkillsBlock {...props} />;
    case "projects": return <ProjectsBlock {...props} />;
    case "certifications": case "awards": case "volunteer": case "publications": return <GenericBlock {...props} />;
    default: return <CustomTextBlock {...props} />;
  }
}

/* ══════════════════════════════════════════════════════════════════
   Main Document
   ══════════════════════════════════════════════════════════════════ */

type PdfDocumentProps = {
  blocks: ResumeBlock[];
  templateStyles: TemplateStyles;
  designSettings: ResumeDesignSettings;
  userPlan: string;
};

export function PdfDocument({ blocks, templateStyles: ts, designSettings, userPlan }: PdfDocumentProps) {
  const ds = designSettings || DEFAULT_DESIGN_SETTINGS;
  const rf = fontFor(ds.fontFamily);
  const ac = ds.accentColor || ts.accentColor;

  const p: Omit<Props, "block"> = {
    style: ts, accentColor: ac, baseFontSize: ds.baseFontSize,
    lineHeight: ds.lineHeight, sectionSpacing: ds.sectionSpacing, resolvedFont: rf,
  };

  const visible = blocks
    .filter((b) => b.is_visible !== false && hasContent(b))
    .sort((a, b) => a.sort_order - b.sort_order);

  /* Page margins: full on page 1, half on page 2+ */
  const m1Top = ds.margins.top;
  const mNTop = Math.round(ds.margins.top / 2);
  const m1Bot = ds.margins.bottom;
  const mNBot = Math.round(ds.margins.bottom / 2);

  const pageStyle = {
    paddingTop: mNTop,
    paddingBottom: mNBot,
    paddingLeft: ds.margins.left,
    paddingRight: ds.margins.right,
    fontFamily: rf,
    fontSize: ds.baseFontSize,
    lineHeight: ds.lineHeight,
    color: BODY,
  };

  /* Fixed elements: page number + watermark */
  const pageNum = (
    <Text
      style={{ position: "absolute", bottom: Math.max(10, mNBot / 2), right: ds.margins.right, fontSize: 9, color: "#C4C4CC", fontFamily: rf }}
      fixed
      render={({ pageNumber: pn, totalPages: tp }) => tp > 1 ? `${pn} / ${tp}` : ""}
    />
  );

  const watermark = userPlan === "free" ? (
    <Text style={{ position: "absolute", bottom: Math.max(10, mNBot / 2), left: ds.margins.left, fontSize: 8, color: "#9CA3AF", opacity: 0.5, fontFamily: rf }} fixed>
      Built with ReplugCV
    </Text>
  ) : null;

  const topSpacer = <View style={{ height: m1Top - mNTop }} />;

  /* ─── TWO-COLUMN ─── */
  if (ts.layout === "two-column") {
    const sidebarTypes = ts.sidebarBlocks || [];
    const header = visible.find((b) => b.type === "header");
    const rest = visible.filter((b) => b.type !== "header");
    const sidebar = rest.filter((b) => sidebarTypes.includes(b.type));
    const main = rest.filter((b) => !sidebarTypes.includes(b.type));
    const sPct = ts.sidebarWidth || 35;
    const isLeft = ts.sidebarPosition !== "right";
    const hasBg = !!ts.headerBgColor;

    const sideCol = (
      <View style={{ width: `${sPct}%`, backgroundColor: ts.sidebarBgColor || undefined, paddingHorizontal: 10, paddingVertical: 6 }}>
        {sidebar.map((b) => <RenderBlock key={b.id} block={b} p={p} />)}
      </View>
    );
    const mainCol = (
      <View style={{ width: `${100 - sPct}%`, paddingHorizontal: 10, paddingVertical: 6 }}>
        {ts.headerSpan === "main" && header && <View style={{ marginBottom: ds.sectionSpacing }}><RenderBlock block={header} p={p} /></View>}
        {main.map((b) => <RenderBlock key={b.id} block={b} p={p} />)}
      </View>
    );

    return (
      <Document>
        <Page size="A4" style={pageStyle}>
          {topSpacer}
          {ts.headerSpan !== "main" && header && (
            <View style={{ backgroundColor: hasBg ? ts.headerBgColor : undefined, paddingHorizontal: hasBg ? 12 : 0, paddingVertical: hasBg ? 10 : 0, marginBottom: ds.sectionSpacing, marginHorizontal: hasBg ? -ds.margins.left : 0, marginTop: hasBg ? -m1Top : 0, paddingTop: hasBg ? m1Top : 0, paddingLeft: hasBg ? ds.margins.left : 0, paddingRight: hasBg ? ds.margins.right : 0 }}>
              <RenderBlock block={header} p={{ ...p, accentColor: ts.headerTextColor || ac }} />
            </View>
          )}
          <View style={{ flexDirection: "row", flex: 1 }}>
            {isLeft ? <>{sideCol}{mainCol}</> : <>{mainCol}{sideCol}</>}
          </View>
          {pageNum}{watermark}
        </Page>
      </Document>
    );
  }

  /* ─── SINGLE COLUMN ─── */
  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        {topSpacer}
        <View style={{ marginBottom: m1Bot - mNBot }}>
          {visible.map((b) => <RenderBlock key={b.id} block={b} p={p} />)}
        </View>
        {pageNum}{watermark}
      </Page>
    </Document>
  );
}
