"use client";

import type { ResumeBlock, TemplateStyles } from "../types";
import { CONTACT_FIELDS } from "../constants";
import { EditableText } from "./editable-text";

/* ---- Body text color (consistent across resume) ---- */
const BODY_COLOR = "#717180";

/* ---- Section Heading ---- */

function SectionHeading({
  title,
  style,
  accentColor,
}: {
  title: string;
  style: TemplateStyles;
  accentColor?: string;
}) {
  const color = accentColor || style.accentColor;

  if (style.headingStyle === "caps-spaced") {
    return (
      <div className="mb-2 border-b pb-1" style={{ borderColor: "#e5e7eb" }}>
        <h2
          className="font-medium uppercase pb-0.5"
          style={{ color, fontFamily: style.headingFont, fontSize: "0.75em", letterSpacing: "0.2em" }}
        >
          {title}
        </h2>
      </div>
    );
  }

  if (style.headingStyle === "colored-bg") {
    return (
      <div className="mb-2">
        <h2
          className="font-semibold uppercase tracking-wider px-2 py-1 rounded-sm"
          style={{ color: "#FFFFFF", backgroundColor: color, fontFamily: style.headingFont, fontSize: "0.75em" }}
        >
          {title}
        </h2>
      </div>
    );
  }

  if (style.headingStyle === "bordered-left") {
    return (
      <div className="mb-2 flex items-center gap-2">
        <div className="shrink-0 rounded-full" style={{ width: 3, height: 16, backgroundColor: color }} />
        <h2
          className="font-bold uppercase tracking-wider"
          style={{ color, fontFamily: style.headingFont, fontSize: "0.85em" }}
        >
          {title}
        </h2>
      </div>
    );
  }

  if (style.headingStyle === "bold") {
    return (
      <div className="mb-2">
        <h2
          className="font-bold uppercase tracking-widest pb-1"
          style={{ color, fontFamily: style.headingFont, fontSize: "0.85em" }}
        >
          {title}
        </h2>
      </div>
    );
  }

  /* Default: uppercase with thin underline rule (Enhancv style) */
  return (
    <div className="mb-3 pb-1" style={{ borderBottom: "1px solid #E5E7EB" }}>
      <h2
        className="font-semibold uppercase tracking-wide"
        style={{ color, fontFamily: style.headingFont, fontSize: "0.85em", letterSpacing: "0.08em" }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ---- Section Divider — thin line, no extra margin (spacing handled by container) ---- */

function SectionDivider() {
  return <div style={{ borderBottom: "1px solid #E5E7EB" }} />;
}

/* ---- Placeholder ---- */

function PlaceholderBlock({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded border border-dashed border-gray-200 px-3 py-4 text-center">
      <p className="font-semibold text-gray-400" style={{ fontSize: "0.85em" }}>{label}</p>
      <p className="text-gray-300 mt-0.5" style={{ fontSize: "0.85em" }}>{hint}</p>
    </div>
  );
}

/* ---- Drag handle ---- */

/* DragHandle removed — reordering via floating toolbar arrows */
function DragHandle() { return null; }

/* ---- Main block preview ---- */

type BlockPreviewProps = {
  block: ResumeBlock;
  style: TemplateStyles;
  accentColor?: string;
  onUpdateContent?: (content: Record<string, unknown>) => void;
  onUpdateField?: (fieldPath: string, value: unknown) => void;
};

export function BlockPreview({
  block,
  style,
  accentColor,
  onUpdateContent,
  onUpdateField,
}: BlockPreviewProps) {
  const c = block.content as Record<string, unknown>;
  const themeColor = accentColor || style.accentColor;

  /* ======== HEADER ======== */
  if (block.type === "header") {
    const name = (c.name as string) || "";
    const title = (c.title as string) || "";
    const headerImage = (c.headerImage as string) || "";
    const headerImageShape = (c.headerImageShape as string) || "circle";

    return (
      <div className="relative flex flex-col" style={{ textAlign: style.headerAlignment }}>
        {headerImage && (
          <div className="absolute top-0 right-0 z-10">
            <img
              src={headerImage}
              alt="Profile"
              className="object-cover"
              style={{ width: 60, height: 60, borderRadius: headerImageShape === "circle" ? "50%" : 6 }}
            />
          </div>
        )}
        <div>
          <EditableText
            value={name}
            placeholder="YOUR NAME"
            onSave={(v) => onUpdateField?.("name", v)}
            tag="p"
            className="font-bold leading-tight"
            placeholderClassName="not-italic"
            style={{ fontSize: "1.8em", color: name ? themeColor : "#A3A3B0" }}
          />
        </div>
        <div style={{ marginTop: 4 }}>
          <EditableText
            value={title}
            placeholder="The role you are applying for?"
            onSave={(v) => onUpdateField?.("title", v)}
            tag="p"
            className="font-medium"
            placeholderClassName="not-italic"
            style={{ fontSize: "1.1em", color: title ? themeColor : "#A3A3B0" }}
          />
        </div>
      </div>
    );
  }

  /* ======== CONTACT ======== */
  if (block.type === "contact") {
    const fields = CONTACT_FIELDS;

    if (style.contactLayout === "column") {
      return (
        <div>
          <div className="flex flex-col gap-1">
            {fields.map((f) => {
              const Icon = f.icon;
              const val = (c[f.key] as string) || "";
              return (
                <span key={f.key} className="inline-flex items-center gap-1" style={{ fontSize: "1em", color: BODY_COLOR }}>
                  <span style={{ color: themeColor }}><Icon className="size-3 shrink-0" /></span>
                  <EditableText value={val} placeholder={f.label} onSave={(v) => onUpdateField?.(f.key, v)} tag="span" style={{ fontSize: "1em", color: BODY_COLOR }} />
                </span>
              );
            })}
          </div>
          <SectionDivider />
        </div>
      );
    }

    if (style.contactLayout === "two-column") {
      return (
        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {fields.map((f) => {
              const Icon = f.icon;
              const val = (c[f.key] as string) || "";
              return (
                <span key={f.key} className="inline-flex items-center gap-1" style={{ fontSize: "0.9em", color: BODY_COLOR }}>
                  <span style={{ color: themeColor }}><Icon className="size-3 shrink-0" /></span>
                  <EditableText value={val} placeholder={f.label} onSave={(v) => onUpdateField?.(f.key, v)} tag="span" style={{ fontSize: "1em", color: BODY_COLOR }} />
                </span>
              );
            })}
          </div>
          <SectionDivider />
        </div>
      );
    }

    /* Default: inline */
    return (
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ justifyContent: style.headerAlignment === "center" ? "center" : "flex-start" }}>
          {fields.map((f) => {
            const Icon = f.icon;
            const val = (c[f.key] as string) || "";
            return (
              <span key={f.key} className="inline-flex items-center gap-1" style={{ fontSize: "1em", color: BODY_COLOR }}>
                <span style={{ color: themeColor }}><Icon className="size-3 shrink-0" /></span>
                <EditableText value={val} placeholder={f.label} onSave={(v) => onUpdateField?.(f.key, v)} tag="span" className="font-medium" style={{ fontSize: "1em", color: BODY_COLOR }} />
              </span>
            );
          })}
        </div>
        <SectionDivider />
      </div>
    );
  }

  /* ======== SUMMARY ======== */
  if (block.type === "summary") {
    const text = (c.text as string) || "";
    return (
      <div>
        <SectionHeading title="Summary" style={style} accentColor={accentColor} />
        <EditableText
          value={text}
          placeholder="Briefly explain why you're a great fit for the role - use the AI assistant to tailor this summary for each job posting."
          onSave={(v) => onUpdateField?.("text", v)}
          tag="p"
          className="leading-relaxed block"
          style={{ fontSize: "1em", color: BODY_COLOR }}
          multiline
          showToolbar
          aiField="summary"
        />
        <SectionDivider />
      </div>
    );
  }

  /* ======== EXPERIENCE ======== */
  if (block.type === "experience") {
    const items = (c.items as Array<Record<string, unknown>>) || [];

    const handleAddEntry = () => {
      const newItems = [
        ...items,
        { role: "", company: "", startDate: "", endDate: "", location: "", description: "", bullets: [], caseStudyUrl: "" },
      ];
      onUpdateContent?.({ ...c, items: newItems });
    };

    if (items.length === 0) {
      return (
        <div className="relative">
          <SectionHeading title="Experience" style={style} accentColor={accentColor} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold" style={{ fontSize: "1em", color: "#A3A3B0" }}>Title</p>
                  <p className="font-medium" style={{ fontSize: "1em", color: themeColor, opacity: 0.5 }}>Company Name</p>
                </div>
                <div className="flex items-center gap-3 shrink-0" style={{ color: "#A3A3B0", fontSize: "0.9em" }}>
                  <span className="flex items-center gap-1"><span style={{ fontSize: "0.85em" }}>&#128197;</span> Date period</span>
                  <span className="flex items-center gap-1"><span style={{ fontSize: "0.85em" }}>&#128205;</span> Location</span>
                </div>
              </div>
              <ul className="mt-1.5 list-disc pl-5" style={{ fontSize: "0.95em", color: "#A3A3B0" }}>
                <li>Highlight your accomplishments, using numbers if possible.</li>
              </ul>
            </div>
          ))}
          <SectionDivider />
        </div>
      );
    }

    return (
      <div className="relative">
        <SectionHeading title="Experience" style={style} accentColor={accentColor} />
        {items.map((item, i) => (
          <div key={i} className="mb-3 last:mb-0 relative group/entry">
            <DragHandle />
            {/* Row 1: Role+Company LEFT, Date RIGHT */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <EditableText
                    value={(item.role as string) || ""}
                    placeholder="Job Title"
                    onSave={(v) => onUpdateField?.(`items.${i}.role`, v)}
                    tag="span"
                    className="font-semibold"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                  {((item.role as string) || (item.company as string)) && (
                    <span style={{ color: BODY_COLOR }}>, </span>
                  )}
                  <EditableText
                    value={(item.company as string) || ""}
                    placeholder="Company"
                    onSave={(v) => onUpdateField?.(`items.${i}.company`, v)}
                    tag="span"
                    className="font-semibold"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                </div>
                <EditableText
                  value={(item.location as string) || ""}
                  placeholder="City, Country"
                  onSave={(v) => onUpdateField?.(`items.${i}.location`, v)}
                  tag="p"
                  className="block"
                  style={{ fontSize: "1em", color: BODY_COLOR }}
                />
              </div>
              <div className="shrink-0 text-right flex flex-col gap-0.5" style={{ maxWidth: "40%" }}>
                <div className="flex items-center gap-0.5 justify-end flex-wrap">
                  <EditableText
                    value={(item.startDate as string) || ""}
                    placeholder="Start"
                    onSave={(v) => onUpdateField?.(`items.${i}.startDate`, v)}
                    tag="span"
                    className="font-medium"
                    style={{ fontSize: "0.9em", color: BODY_COLOR }}
                  />
                  {((item.startDate as string) || (item.endDate as string)) && (
                    <span style={{ color: BODY_COLOR, fontSize: "0.9em" }}>-</span>
                  )}
                  <EditableText
                    value={(item.endDate as string) || ""}
                    placeholder="End"
                    onSave={(v) => onUpdateField?.(`items.${i}.endDate`, v)}
                    tag="span"
                    className="font-medium"
                    style={{ fontSize: "0.9em", color: BODY_COLOR }}
                  />
                </div>
                {(item.caseStudyUrl as string) && (
                  <span className="font-medium cursor-pointer" style={{ fontSize: "1em", color: themeColor }}>
                    Read Case study
                  </span>
                )}
              </div>
            </div>

            {/* Description / Bullets */}
            <EditableText
              value={(item.description as string) || ""}
              placeholder="Describe your key responsibilities and achievements..."
              onSave={(v) => onUpdateField?.(`items.${i}.description`, v)}
              tag="p"
              className="mt-1 leading-relaxed block"
              style={{ fontSize: "1em", color: BODY_COLOR }}
              multiline
              showToolbar
              aiField="experience.description"
            />
            {((item.bullets as string[]) || []).length > 0 && (
              <ul className="mt-1 list-disc pl-5 leading-relaxed" style={{ fontSize: "1em", color: BODY_COLOR }}>
                {((item.bullets as string[]) || []).map((b: string, j: number) => (
                  <EditableText
                    key={j}
                    value={b}
                    placeholder="Add an accomplishment (use numbers when possible)"
                    onSave={(v) => {
                      const bullets = [...((item.bullets as string[]) || [])];
                      bullets[j] = v;
                      onUpdateField?.(`items.${i}.bullets`, bullets);
                    }}
                    tag="li"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
        <SectionDivider />
      </div>
    );
  }

  /* ======== EDUCATION ======== */
  if (block.type === "education") {
    const items = (c.items as Array<Record<string, unknown>>) || [];

    const handleAddEntry = () => {
      const newItems = [
        ...items,
        { degree: "", field: "", school: "", startYear: "", endYear: "", location: "", gpa: "" },
      ];
      onUpdateContent?.({ ...c, items: newItems });
    };

    if (items.length === 0) {
      return (
        <div className="relative">
          <SectionHeading title="Education" style={style} accentColor={accentColor} />
          <div className="mb-3">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold" style={{ fontSize: "1em", color: themeColor, opacity: 0.5 }}>Degree and Field of Study</p>
                <p className="font-medium" style={{ fontSize: "1em", color: themeColor, opacity: 0.5 }}>School or University</p>
              </div>
              <div className="flex items-center gap-3 shrink-0" style={{ color: "#A3A3B0", fontSize: "0.9em" }}>
                <span className="flex items-center gap-1"><span style={{ fontSize: "0.85em" }}>&#128197;</span> Date period</span>
                <span className="flex items-center gap-1"><span style={{ fontSize: "0.85em" }}>&#128205;</span> Location</span>
              </div>
            </div>
          </div>
          <SectionDivider />
        </div>
      );
    }

    return (
      <div className="relative">
        <SectionHeading title="Education" style={style} accentColor={accentColor} />
        {items.map((item, i) => (
          <div key={i} className="mb-3 last:mb-0 relative group/entry">
            <DragHandle />
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <EditableText
                    value={(item.degree as string) || ""}
                    placeholder="Degree (e.g. Masters in Interaction Design)"
                    onSave={(v) => onUpdateField?.(`items.${i}.degree`, v)}
                    tag="span"
                    className="font-semibold"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                </div>
                <EditableText
                  value={(item.school as string) || ""}
                  placeholder="University or Institution"
                  onSave={(v) => onUpdateField?.(`items.${i}.school`, v)}
                  tag="p"
                  className="block"
                  style={{ fontSize: "1em", color: BODY_COLOR }}
                />
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 justify-end">
                  <EditableText
                    value={(item.startYear as string) || ""}
                    placeholder="Start"
                    onSave={(v) => onUpdateField?.(`items.${i}.startYear`, v)}
                    tag="span"
                    className="font-medium"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                  {((item.startYear as string) || (item.endYear as string)) && (
                    <span style={{ color: BODY_COLOR, fontSize: "1em" }}>-</span>
                  )}
                  <EditableText
                    value={(item.endYear as string) || ""}
                    placeholder="End"
                    onSave={(v) => onUpdateField?.(`items.${i}.endYear`, v)}
                    tag="span"
                    className="font-medium"
                    style={{ fontSize: "1em", color: BODY_COLOR }}
                  />
                </div>
              </div>
            </div>
            {(item.gpa as string) && (
              <EditableText
                value={(item.gpa as string) || ""}
                placeholder="GPA (optional)"
                onSave={(v) => onUpdateField?.(`items.${i}.gpa`, v)}
                tag="p"
                className="block mt-0.5"
                style={{ fontSize: "0.9em", color: BODY_COLOR }}
              />
            )}
          </div>
        ))}
        <SectionDivider />
      </div>
    );
  }

  /* ======== SKILLS / LANGUAGES / INTERESTS ======== */
  if (block.type === "skills" || block.type === "languages" || block.type === "interests") {
    const items = (c.items as string[]) || [];

    const handleAddSkill = () => {
      const newItems = [...items, ""];
      onUpdateContent?.({ ...c, items: newItems });
    };

    if (items.length === 0) {
      return (
        <div className="relative">
          <SectionHeading title={block.title} style={style} accentColor={accentColor} />
          <span className="inline-block rounded px-2 py-0.5 border border-dashed" style={{ fontSize: "0.9em", color: themeColor, opacity: 0.5, borderColor: themeColor }}>
            Your Skill
          </span>
          <SectionDivider />
        </div>
      );
    }

    const renderSkills = () => {
      if (style.skillsStyle === "tags") {
        return (
          <div className="flex flex-wrap gap-1.5">
            {items.map((skill, i) => (
              <span key={i} className="group/pill rounded bg-gray-100 px-2 py-0.5 font-medium inline-flex items-center gap-1" style={{ fontSize: "0.75em", color: BODY_COLOR }}>
                <EditableText
                  value={skill}
                  placeholder="Skill name"
                  onSave={(v) => {
                    const newItems = [...items];
                    if (v === "") newItems.splice(i, 1); else newItems[i] = v;
                    onUpdateContent?.({ ...c, items: newItems });
                  }}
                  tag="span"
                  className="font-medium"
                  style={{ fontSize: "1em", color: BODY_COLOR }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); const newItems = [...items]; newItems.splice(i, 1); onUpdateContent?.({ ...c, items: newItems }); }}
                  className="opacity-0 group-hover/pill:opacity-100 flex items-center justify-center size-3.5 rounded-full bg-gray-300 hover:bg-red-400 text-white text-[8px] font-bold border-none cursor-pointer transition-opacity leading-none"
                  title="Remove skill"
                >×</button>
              </span>
            ))}
          </div>
        );
      }

      if (style.skillsStyle === "bars") {
        return (
          <div className="space-y-1.5">
            {items.map((skill, i) => (
              <div key={i} className="group/pill flex items-center gap-2">
                <EditableText value={skill} placeholder="Skill name" onSave={(v) => { const n = [...items]; if (v === "") n.splice(i, 1); else n[i] = v; onUpdateContent?.({ ...c, items: n }); }} tag="span" className="shrink-0" style={{ fontSize: "0.85em", color: BODY_COLOR, minWidth: 60 }} />
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${70 + (i % 4) * 8}%`, backgroundColor: themeColor }} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); const n = [...items]; n.splice(i, 1); onUpdateContent?.({ ...c, items: n }); }} className="opacity-0 group-hover/pill:opacity-100 flex items-center justify-center size-3.5 rounded-full bg-gray-300 hover:bg-red-400 text-white text-[8px] font-bold border-none cursor-pointer transition-opacity leading-none shrink-0" title="Remove">×</button>
              </div>
            ))}
          </div>
        );
      }

      if (style.skillsStyle === "list") {
        return (
          <ul className="list-disc pl-4 leading-relaxed" style={{ fontSize: "1em", color: BODY_COLOR }}>
            {items.map((skill, i) => (
              <EditableText
                key={i}
                value={skill}
                placeholder="Type a skill"
                onSave={(v) => { const n = [...items]; if (v === "") n.splice(i, 1); else n[i] = v; onUpdateContent?.({ ...c, items: n }); }}
                tag="li"
                style={{ fontSize: "1em", color: BODY_COLOR }}
              />
            ))}
          </ul>
        );
      }

      /* Default: inline comma-separated (per Figma design) */
      return (
        <p className="font-semibold" style={{ fontSize: "1em", color: BODY_COLOR }}>
          {items.map((skill, i) => (
            <span key={i} className="group/pill inline">
              <EditableText
                value={skill}
                placeholder="Skill"
                onSave={(v) => { const n = [...items]; if (v === "") n.splice(i, 1); else n[i] = v; onUpdateContent?.({ ...c, items: n }); }}
                tag="span"
                className="font-semibold"
                style={{ fontSize: "1em", color: BODY_COLOR }}
              />
              {i < items.length - 1 && <span>, </span>}
            </span>
          ))}
        </p>
      );
    };

    return (
      <div className="relative">
        <SectionHeading title={block.title} style={style} accentColor={accentColor} />
        {renderSkills()}
        <SectionDivider />
      </div>
    );
  }

  /* ======== PROJECTS ======== */
  if (block.type === "projects") {
    const items = (c.items as Array<Record<string, unknown>>) || [];

    const handleAddEntry = () => {
      const newItems = [...items, { name: "", url: "", description: "" }];
      onUpdateContent?.({ ...c, items: newItems });
    };

    if (items.length === 0) {
      return (
        <div className="relative">
          <SectionHeading title="Projects" style={style} accentColor={accentColor} />
          <PlaceholderBlock label="Projects" hint="Add your projects" />
          <SectionDivider />
        </div>
      );
    }

    return (
      <div className="relative">
        <SectionHeading title="Projects" style={style} accentColor={accentColor} />
        {items.map((item, i) => (
          <div key={i} className="mb-2 last:mb-0 relative group/entry">
            <DragHandle />
            <EditableText value={(item.name as string) || ""} placeholder="Project Name" onSave={(v) => onUpdateField?.(`items.${i}.name`, v)} tag="span" className="font-semibold" style={{ fontSize: "1em", color: BODY_COLOR }} />
            {(item.url as string) && (
              <span className="ml-1" style={{ fontSize: "0.85em", color: themeColor }}>
                (<EditableText value={(item.url as string) || ""} placeholder="URL" onSave={(v) => onUpdateField?.(`items.${i}.url`, v)} tag="span" style={{ fontSize: "1em", color: themeColor }} />)
              </span>
            )}
            <EditableText value={(item.description as string) || ""} placeholder="Project description..." onSave={(v) => onUpdateField?.(`items.${i}.description`, v)} tag="p" className="mt-0.5 leading-relaxed block" style={{ fontSize: "1em", color: BODY_COLOR }} multiline />
          </div>
        ))}
        <SectionDivider />
      </div>
    );
  }

  /* ======== GENERIC (certs, awards, volunteer, publications) ======== */
  if (["certifications", "awards", "volunteer", "publications"].includes(block.type)) {
    const items = (c.items as Array<Record<string, unknown>>) || [];

    const handleAddEntry = () => {
      const newItems = [...items, { title: "", date: "", description: "" }];
      onUpdateContent?.({ ...c, items: newItems });
    };

    if (items.length === 0) {
      return (
        <div className="relative">
          <SectionHeading title={block.title} style={style} accentColor={accentColor} />
          <PlaceholderBlock label={block.title} hint={`Add your ${block.title.toLowerCase()}`} />
          <SectionDivider />
        </div>
      );
    }

    return (
      <div className="relative">
        <SectionHeading title={block.title} style={style} accentColor={accentColor} />
        {items.map((item, i) => (
          <div key={i} className="mb-2 last:mb-0 relative group/entry">
            <DragHandle />
            <div className="flex items-baseline justify-between">
              <EditableText value={(item.title as string) || ""} placeholder={block.title} onSave={(v) => onUpdateField?.(`items.${i}.title`, v)} tag="span" className="font-semibold" style={{ fontSize: "1em", color: BODY_COLOR }} />
              <EditableText value={(item.date as string) || ""} placeholder="Date" onSave={(v) => onUpdateField?.(`items.${i}.date`, v)} tag="span" className="shrink-0 ml-2 font-medium" style={{ fontSize: "1em", color: BODY_COLOR }} />
            </div>
            <EditableText value={(item.description as string) || ""} placeholder="Description..." onSave={(v) => onUpdateField?.(`items.${i}.description`, v)} tag="p" className="mt-0.5 leading-relaxed block" style={{ fontSize: "1em", color: BODY_COLOR }} multiline />
          </div>
        ))}
        <SectionDivider />
      </div>
    );
  }

  /* ======== CUSTOM ======== */
  const text = (c.text as string) || "";
  return (
    <div>
      <SectionHeading title={block.title} style={style} accentColor={accentColor} />
      <EditableText value={text} placeholder="Add content..." onSave={(v) => onUpdateField?.("text", v)} tag="p" className="leading-relaxed block" style={{ fontSize: "1em", color: BODY_COLOR }} multiline />
      <SectionDivider />
    </div>
  );
}
