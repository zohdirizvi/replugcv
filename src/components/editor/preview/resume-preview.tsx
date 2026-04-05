"use client";

import { cx } from "@/utils/cx";
import { useEditorContext } from "../editor-context";
import { TEMPLATES } from "../constants";
import type { ResumeBlock, TemplateStyles } from "../types";
import { BlockPreview } from "./block-previews";
import { SectionToolbar } from "./section-toolbar";

/* ── Shared wrapper for each block (selection, hover, toolbar) ── */

function BlockWrapper({
  block,
  blocks,
  style,
  accentColor,
  selectedBlockId,
  onSelect,
  onNavigateToStep,
  onAddEntry,
  onDelete,
  onReorder,
  onUpdateContent,
  onUpdateField,
  blockRefs,
  scrollToBlock,
}: {
  block: ResumeBlock;
  blocks: ResumeBlock[];
  style: TemplateStyles;
  accentColor: string;
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onNavigateToStep: (step: number) => void;
  onAddEntry: (block: ResumeBlock) => void;
  onDelete: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onUpdateContent: (id: string, content: Record<string, unknown>) => void;
  onUpdateField: (id: string, fieldPath: string, value: unknown) => void;
  blockRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  scrollToBlock: (id: string) => void;
}) {
  const isSelected = selectedBlockId === block.id;
  const blockIdx = blocks.indexOf(block);

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
      onClick={(e) => {
        const target = e.target as HTMLElement;
        onSelect(block.id);
        const step = stepMap[block.type];
        if (step) onNavigateToStep(step);
        if (!target.isContentEditable) scrollToBlock(block.id);
      }}
      className={cx(
        "relative cursor-pointer transition-all group/section",
        isSelected
          ? "border-l-2 border border-[#065f46] rounded-[4px] px-3 py-1"
          : ""
      )}
      style={{
        opacity: selectedBlockId && !isSelected ? 0.4 : 1,
      }}
    >
      {isSelected && (
        <SectionToolbar
          blockType={block.type}
          blockTitle={block.title}
          onAddEntry={canAddEntry ? () => onAddEntry(block) : undefined}
          onDelete={() => onDelete(block.id)}
          onMoveUp={blockIdx > 0 ? () => onReorder(blockIdx, blockIdx - 1) : undefined}
          onMoveDown={blockIdx < blocks.length - 1 ? () => onReorder(blockIdx, blockIdx + 1) : undefined}
          canMoveUp={blockIdx > 0}
          canMoveDown={blockIdx < blocks.length - 1}
        />
      )}

      <BlockPreview
        block={block}
        style={style}
        accentColor={accentColor}
        onUpdateContent={(content) => onUpdateContent(block.id, content)}
        onUpdateField={(fieldPath, value) => onUpdateField(block.id, fieldPath, value)}
      />
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
    deleteBlock,
    reorderBlocks,
    designSettings,
  } = useEditorContext();

  const style = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const visibleBlocks = blocks.filter((b) => b.is_visible !== false);
  const accentColor = designSettings.accentColor || style.accentColor;

  const handleAddEntry = (block: ResumeBlock) => {
    const c = block.content as Record<string, unknown>;
    if (block.type === "experience") {
      const items = [...((c.items as Array<Record<string, unknown>>) || [])];
      items.push({ role: "", company: "", startDate: "", endDate: "", description: "", bullets: [] });
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

  /* Shared props for BlockWrapper */
  const wrapperProps = {
    blocks,
    style,
    accentColor,
    selectedBlockId,
    onSelect: setSelectedBlockId,
    onNavigateToStep: handleNavigateToStep,
    onAddEntry: handleAddEntry,
    onDelete: (id: string) => deleteBlock(id),
    onReorder: reorderBlocks,
    onUpdateContent: updateBlockContent,
    onUpdateField: updateBlockField,
    blockRefs,
    scrollToBlock,
  };

  /* ─── TWO-COLUMN layout ─── */
  if (style.layout === "two-column") {
    const sidebarTypes = style.sidebarBlocks || [];

    // Header always renders first (full or main based on headerSpan)
    const headerBlock = visibleBlocks.find((b) => b.type === "header");
    const nonHeaderBlocks = visibleBlocks.filter((b) => b.type !== "header");

    // Split blocks into sidebar and main
    const sidebarBlocks = nonHeaderBlocks.filter((b) => sidebarTypes.includes(b.type));
    const mainBlocks = nonHeaderBlocks.filter((b) => !sidebarTypes.includes(b.type));

    const sidebarPct = style.sidebarWidth || 35;
    const mainPct = 100 - sidebarPct;
    const isLeftSidebar = style.sidebarPosition !== "right";
    const sidebarBg = style.sidebarBgColor || "transparent";
    const sidebarText = style.sidebarTextColor;

    const renderSidebar = () => (
      <div
        style={{
          width: `${sidebarPct}%`,
          backgroundColor: sidebarBg,
          padding: "0 12px",
          color: sidebarText || undefined,
          display: "flex",
          flexDirection: "column",
          gap: designSettings.sectionSpacing,
        }}
      >
        {sidebarBlocks.map((block) => (
          <BlockWrapper key={block.id} block={block} {...wrapperProps} />
        ))}
      </div>
    );

    const renderMain = () => (
      <div
        style={{
          width: `${mainPct}%`,
          padding: "0 12px",
          display: "flex",
          flexDirection: "column",
          gap: designSettings.sectionSpacing,
        }}
      >
        {/* If header lives in main area */}
        {style.headerSpan === "main" && headerBlock && (
          <BlockWrapper block={headerBlock} {...wrapperProps} />
        )}
        {mainBlocks.map((block) => (
          <BlockWrapper key={block.id} block={block} {...wrapperProps} />
        ))}
      </div>
    );

    return (
      <div>
        {/* Full-width header (if headerSpan is "full") */}
        {style.headerSpan !== "main" && headerBlock && (
          <div
            style={{
              backgroundColor: style.headerBgColor || undefined,
              color: style.headerTextColor || undefined,
              padding: style.headerBgColor ? "16px 12px" : undefined,
              marginBottom: designSettings.sectionSpacing,
            }}
          >
            <BlockWrapper block={headerBlock} {...wrapperProps} />
          </div>
        )}

        {/* Two-column body */}
        <div
          style={{
            display: "flex",
            gap: 0,
            minHeight: 400,
          }}
        >
          {isLeftSidebar ? (
            <>
              {renderSidebar()}
              {/* Subtle divider between columns */}
              <div style={{ width: 1, backgroundColor: "#E5E7EB", flexShrink: 0 }} />
              {renderMain()}
            </>
          ) : (
            <>
              {renderMain()}
              <div style={{ width: 1, backgroundColor: "#E5E7EB", flexShrink: 0 }} />
              {renderSidebar()}
            </>
          )}
        </div>
      </div>
    );
  }

  /* ─── SINGLE COLUMN layout (default) ─── */
  if (visibleBlocks.length === 0) {
    return (
      <div className="flex h-[762px] flex-col items-center justify-center text-gray-400">
        <p className="text-sm">No blocks yet. Add a section to get started.</p>
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
