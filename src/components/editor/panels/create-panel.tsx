"use client";

import { useState } from "react";
import { ChevronDown, File06, Move } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { useEditorContext } from "../editor-context";
import { BLOCK_META } from "../constants";
import { BlockForm } from "../forms/block-forms";

/* ---- Collapsible section wrapper ---- */
function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-primary bg-transparent border-none cursor-pointer hover:bg-secondary transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cx(
            "size-4 text-fg-quaternary transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}

/* ---- Layout thumbnails ---- */
function LayoutThumbnail({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 cursor-pointer bg-primary transition-colors",
        active ? "border-[#8B5CF6]" : "border-secondary hover:border-[#8B5CF6]/40"
      )}
    >
      <div className="flex h-10 w-full items-center justify-center">{children}</div>
      <span className={cx("text-[10px] font-medium", active ? "text-[#8B5CF6]" : "text-tertiary")}>
        {label}
      </span>
    </button>
  );
}

export function CreatePanel() {
  const {
    blocks,
    selectedBlockId,
    expandedBlockId,
    setExpandedBlockId,
    scrollToBlock,
    updateBlockContent,
    updateBlockTitle,
    dragIdx,
    dragOverIdx,
    setDragIdx,
    setDragOverIdx,
    handleDragEnd,
  } = useEditorContext();

  const [layout, setLayout] = useState<"top" | "left" | "right">("top");
  const [columns, setColumns] = useState<1 | 2>(2);
  const [columnWidth, setColumnWidth] = useState(50);
  const [headingStyle, setHeadingStyle] = useState<number>(0);

  return (
    <div className="flex flex-col">
      {/* Layout section */}
      <Section title="Layout">
        <div className="grid grid-cols-3 gap-2">
          <LayoutThumbnail label="Top" active={layout === "top"} onClick={() => setLayout("top")}>
            <div className="flex w-full flex-col gap-0.5">
              <div className="h-2 w-full rounded-sm bg-[#8B5CF6]/20" />
              <div className="h-5 w-full rounded-sm bg-gray-100" />
            </div>
          </LayoutThumbnail>
          <LayoutThumbnail label="Left" active={layout === "left"} onClick={() => setLayout("left")}>
            <div className="flex w-full gap-0.5 h-full">
              <div className="w-1/3 rounded-sm bg-[#8B5CF6]/20" />
              <div className="flex-1 rounded-sm bg-gray-100" />
            </div>
          </LayoutThumbnail>
          <LayoutThumbnail label="Right" active={layout === "right"} onClick={() => setLayout("right")}>
            <div className="flex w-full gap-0.5 h-full">
              <div className="flex-1 rounded-sm bg-gray-100" />
              <div className="w-1/3 rounded-sm bg-[#8B5CF6]/20" />
            </div>
          </LayoutThumbnail>
        </div>
      </Section>

      {/* Column section */}
      <Section title="Column">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setColumns(1)}
            className={cx(
              "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 cursor-pointer bg-primary transition-colors",
              columns === 1 ? "border-[#8B5CF6]" : "border-secondary hover:border-[#8B5CF6]/40"
            )}
          >
            <div className="flex h-8 w-full items-center justify-center">
              <div className="h-full w-3/4 rounded-sm bg-gray-100" />
            </div>
            <span
              className={cx(
                "text-[10px] font-medium",
                columns === 1 ? "text-[#8B5CF6]" : "text-tertiary"
              )}
            >
              1 Column
            </span>
          </button>
          <button
            onClick={() => setColumns(2)}
            className={cx(
              "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 cursor-pointer bg-primary transition-colors",
              columns === 2 ? "border-[#8B5CF6]" : "border-secondary hover:border-[#8B5CF6]/40"
            )}
          >
            <div className="flex h-8 w-full items-center justify-center gap-1">
              <div className="h-full flex-1 rounded-sm bg-gray-100" />
              <div className="h-full flex-1 rounded-sm bg-gray-100" />
            </div>
            <span
              className={cx(
                "text-[10px] font-medium",
                columns === 2 ? "text-[#8B5CF6]" : "text-tertiary"
              )}
            >
              2 Column
            </span>
          </button>
        </div>

        {columns === 2 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-tertiary shrink-0">Left</span>
            <input
              type="range"
              min={30}
              max={70}
              value={columnWidth}
              onChange={(e) => setColumnWidth(Number(e.target.value))}
              className="flex-1 accent-[#8B5CF6] h-1"
            />
            <span className="text-[10px] font-medium text-tertiary shrink-0">Right</span>
          </div>
        )}
      </Section>

      {/* Rearrange Section */}
      <Section title="Rearrange Section">
        <div className="flex flex-col gap-1">
          {blocks.map((block, idx) => {
            const meta = BLOCK_META[block.type] || { icon: File06, label: block.type };
            const Icon = meta.icon;
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDragEnd={handleDragEnd}
                className={cx(
                  "flex items-center gap-2 rounded-lg border border-secondary bg-primary px-2.5 py-2 cursor-grab transition-all",
                  dragOverIdx === idx && dragIdx !== idx && "ring-2 ring-[#8B5CF6]/40",
                  selectedBlockId === block.id && "border-[#8B5CF6]/40 bg-[#8B5CF6]/5"
                )}
              >
                <Move className="size-3.5 text-fg-quaternary shrink-0" />
                <Icon className="size-3.5 text-fg-quaternary shrink-0" />
                <span className="text-xs font-medium text-primary truncate">{block.title}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Heading section */}
      <Section title="Heading">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((styleIdx) => (
            <button
              key={styleIdx}
              onClick={() => setHeadingStyle(styleIdx)}
              className={cx(
                "flex flex-col items-center gap-1 rounded-lg border-2 p-2 cursor-pointer bg-primary transition-colors",
                headingStyle === styleIdx
                  ? "border-[#8B5CF6]"
                  : "border-secondary hover:border-[#8B5CF6]/40"
              )}
            >
              <div className="w-full h-6 flex flex-col justify-center">
                {styleIdx === 0 && (
                  <>
                    <div className="h-1.5 w-3/4 rounded-sm bg-gray-700 mb-0.5" />
                    <div className="h-px w-full bg-gray-300" />
                  </>
                )}
                {styleIdx === 1 && (
                  <div className="h-1.5 w-3/4 rounded-sm bg-gray-700 border-b-2 border-[#8B5CF6]" />
                )}
                {styleIdx === 2 && (
                  <div className="h-4 w-3/4 rounded-sm bg-[#8B5CF6]/10 flex items-center px-1">
                    <div className="h-1 w-full rounded-sm bg-gray-700" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Block editing (expandable) */}
      <div className="mt-2 border-t border-secondary pt-2">
        <span className="mb-2 block px-2 text-[11px] font-semibold uppercase tracking-wider text-quaternary">
          Sections
        </span>
        <div className="flex flex-col gap-0.5">
          {blocks.map((block, idx) => {
            const meta = BLOCK_META[block.type] || { icon: File06, label: block.type };
            const Icon = meta.icon;
            const isSelected = selectedBlockId === block.id;
            const isExpanded = expandedBlockId === block.id;

            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDragEnd={handleDragEnd}
                className={cx(
                  "rounded-lg transition",
                  dragOverIdx === idx && dragIdx !== idx && "ring-2 ring-[#8B5CF6]/40"
                )}
              >
                <button
                  onClick={() => {
                    scrollToBlock(block.id);
                    setExpandedBlockId(isExpanded ? null : block.id);
                  }}
                  className={cx(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium cursor-pointer border-none transition-colors",
                    isSelected
                      ? "bg-[#8B5CF6]/8 text-[#8B5CF6]"
                      : "bg-transparent text-tertiary hover:bg-secondary hover:text-primary"
                  )}
                >
                  <span className="flex shrink-0 cursor-grab text-fg-quaternary select-none text-[10px] leading-none tracking-tighter">
                    &#x2807;
                  </span>
                  <Icon
                    className={cx(
                      "size-3.5 shrink-0",
                      isSelected ? "text-[#8B5CF6]" : "text-fg-quaternary"
                    )}
                  />
                  <span className="flex-1 truncate">{block.title}</span>
                  <ChevronDown
                    className={cx(
                      "size-3.5 text-fg-quaternary transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="px-2 pb-3 pt-1">
                    <div className="rounded-lg border border-secondary bg-primary p-3">
                      <BlockForm
                        block={block}
                        updateContent={updateBlockContent}
                        updateTitle={updateBlockTitle}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
