"use client";

import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import type { ResumeBlock, TemplateStyles } from "../types";
import { BlockPreview } from "./block-previews";
import { AddEntryButton } from "./add-entry-button";

/* ── Block wrapper — clean, no UI chrome inside the page ── */

function BlockWrapper({
  block,
  style,
  accentColor,
  selectedBlockId,
  onSelect,
  onNavigateToStep,
  onAddEntry,
  onUpdateContent,
  onUpdateField,
  blockRefs,
  scrollToBlock,
}: {
  block: ResumeBlock;
  style: TemplateStyles;
  accentColor: string;
  selectedBlockId: string | null;
  onSelect: (id: string | null) => void;
  onNavigateToStep: (step: number) => void;
  onAddEntry: (block: ResumeBlock) => void;
  onUpdateContent: (id: string, content: Record<string, unknown>) => void;
  onUpdateField: (id: string, fieldPath: string, value: unknown) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  scrollToBlock: (id: string) => void;
}) {
  const isSelected = selectedBlockId === block.id;

  const stepMap: Record<string, number> = {
    header: 1, contact: 1,
    summary: 2,
    experience: 3,
    education: 4,
    skills: 5, languages: 5, interests: 5,
  };

  const canAddEntry = [
    "experience", "education", "skills", "languages", "interests",
    "projects", "certifications", "awards", "volunteer", "publications",
  ].includes(block.type);

  return (
    <div
      ref={(el) => { blockRefs.current[block.id] = el; }}
      data-block-id={block.id}
      data-block-type={block.type}
      onClick={(e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (isSelected && target.isContentEditable) return;
        if (isSelected) { onSelect(null); return; }
        onSelect(block.id);
        const step = stepMap[block.type];
        if (step) onNavigateToStep(step);
        if (!target.isContentEditable) scrollToBlock(block.id);
      }}
      className="relative cursor-pointer group/section"
      style={{
        // Subtle selection: thin border, NO opacity dimming on others
        // The page always looks like a real resume
        ...(isSelected ? {
          outline: "1.5px solid rgba(5, 150, 105, 0.4)",
          outlineOffset: 2,
          borderRadius: 3,
        } : {}),
      }}
    >
      <BlockPreview
        block={block}
        style={style}
        accentColor={accentColor}
        onUpdateContent={(content) => onUpdateContent(block.id, content)}
        onUpdateField={(fieldPath, value) => onUpdateField(block.id, fieldPath, value)}
      />

      {/* Add entry: subtle + circle, only on hover/select */}
      {isSelected && canAddEntry && (
        <AddEntryButton onClick={() => onAddEntry(block)} label={`Add ${block.type}`} />
      )}
    </div>
  );
}

/* ── Main ResumePreview ── */

export function ResumePreview() {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    scrollToBlock,
    templateId,
    blockRefs,
    setCurrentStep,
    updateBlockContent,
    updateBlockField,
    designSettings,
  } = useEditorContext();

  const style = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const visibleBlocks = blocks.filter((b) => b.is_visible !== false);
  const accentColor = designSettings.accentColor || style.accentColor;

  const handleAddEntry = (block: ResumeBlock) => {
    const c = block.content as Record<string, unknown>;
    if (block.type === "experience") {
      const items = [...((c.items as Array<Record<string, unknown>>) || [])];
      items.push({ role: "", company: "", startDate: "", endDate: "", location: "", description: "", bullets: [], caseStudyUrl: "" });
      updateBlockContent(block.id, { ...c, items });
    } else if (block.type === "education") {
      const items = [...((c.items as Array<Record<string, unknown>>) || [])];
      items.push({ degree: "", field: "", school: "", startYear: "", endYear: "", gpa: "" });
      updateBlockContent(block.id, { ...c, items });
    } else if (block.type === "skills" || block.type === "languages" || block.type === "interests") {
      const items = [...((c.items as string[]) || [])];
      items.push("");
      updateBlockContent(block.id, { ...c, items });
    } else if (block.type === "projects") {
      const items = [...((c.items as Array<Record<string, unknown>>) || [])];
      items.push({ name: "", url: "", description: "" });
      updateBlockContent(block.id, { ...c, items });
    } else if (["certifications", "awards", "volunteer", "publications"].includes(block.type)) {
      const items = [...((c.items as Array<Record<string, unknown>>) || [])];
      items.push({ title: "", date: "", description: "" });
      updateBlockContent(block.id, { ...c, items });
    }
  };

  const handleNavigateToStep = (step: number) => {
    setCurrentStep(step as 1 | 2 | 3 | 4 | 5 | 6);
  };

  const wrapperProps = {
    style,
    accentColor,
    selectedBlockId,
    onSelect: setSelectedBlockId,
    onNavigateToStep: handleNavigateToStep,
    onAddEntry: handleAddEntry,
    onUpdateContent: updateBlockContent,
    onUpdateField: updateBlockField,
    blockRefs,
    scrollToBlock,
  };

  /* ─── TWO-COLUMN layout ─── */
  if (style.layout === "two-column") {
    const sidebarTypes = style.sidebarBlocks || [];
    const headerBlock = visibleBlocks.find((b) => b.type === "header");
    const nonHeaderBlocks = visibleBlocks.filter((b) => b.type !== "header");
    const sidebarBlocks = nonHeaderBlocks.filter((b) => sidebarTypes.includes(b.type));
    const mainBlocks = nonHeaderBlocks.filter((b) => !sidebarTypes.includes(b.type));
    const sidebarPct = style.sidebarWidth || 35;
    const mainPct = 100 - sidebarPct;
    const isLeftSidebar = style.sidebarPosition !== "right";

    const sidebar = (
      <div style={{ width: `${sidebarPct}%`, backgroundColor: style.sidebarBgColor || "transparent", padding: "0 12px", color: style.sidebarTextColor || undefined }}>
        {sidebarBlocks.map((b) => <BlockWrapper key={b.id} block={b} {...wrapperProps} />)}
      </div>
    );
    const main = (
      <div style={{ width: `${mainPct}%`, padding: "0 12px" }}>
        {style.headerSpan === "main" && headerBlock && <BlockWrapper block={headerBlock} {...wrapperProps} />}
        {mainBlocks.map((b) => <BlockWrapper key={b.id} block={b} {...wrapperProps} />)}
      </div>
    );

    return (
      <div>
        {style.headerSpan !== "main" && headerBlock && (
          <div style={{ backgroundColor: style.headerBgColor || undefined, color: style.headerTextColor || undefined, padding: style.headerBgColor ? "16px 12px" : undefined, marginBottom: designSettings.sectionSpacing }}>
            <BlockWrapper block={headerBlock} {...wrapperProps} />
          </div>
        )}
        <div style={{ display: "flex" }}>
          {isLeftSidebar ? <>{sidebar}<div style={{ width: 1, backgroundColor: "#E5E7EB" }} />{main}</> : <>{main}<div style={{ width: 1, backgroundColor: "#E5E7EB" }} />{sidebar}</>}
        </div>
      </div>
    );
  }

  /* ─── SINGLE COLUMN ─── */
  if (visibleBlocks.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-gray-400">
        <p className="text-sm">Click a section to start editing</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: designSettings.sectionSpacing }}>
      {visibleBlocks.map((block) => (
        <BlockWrapper key={block.id} block={block} {...wrapperProps} />
      ))}
    </div>
  );
}
