"use client";

import { Plus, Trash01, ChevronUp, ChevronDown } from "@untitledui/icons";

type SectionToolbarProps = {
  blockType: string;
  blockTitle?: string;
  onAddEntry?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export function SectionToolbar({
  blockType,
  blockTitle,
  onAddEntry,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: SectionToolbarProps) {
  const addLabel =
    blockType === "skills" || blockType === "languages" || blockType === "interests"
      ? "+ Skill"
      : blockType === "experience"
      ? "+ Entry"
      : blockType === "education"
      ? "+ Entry"
      : blockType === "projects"
      ? "+ Project"
      : null;

  return (
    <div
      className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-lg bg-white px-2 py-1 shadow-lg border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      {addLabel && onAddEntry && (
        <button
          onClick={onAddEntry}
          className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#16A34A" }}
        >
          <Plus className="size-3" />
          {addLabel}
        </button>
      )}

      {canMoveUp && onMoveUp && (
        <button
          onClick={onMoveUp}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
          title="Move up"
        >
          <ChevronUp className="size-3.5" />
        </button>
      )}

      {canMoveDown && onMoveDown && (
        <button
          onClick={onMoveDown}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
          title="Move down"
        >
          <ChevronDown className="size-3.5" />
        </button>
      )}

      {/* Section title */}
      {blockTitle && (
        <span className="text-[11px] font-semibold text-gray-700 px-1.5 select-none">
          {blockTitle}
        </span>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 border-none bg-transparent cursor-pointer transition-colors"
          title="Delete section"
        >
          <Trash01 className="size-3.5" />
        </button>
      )}
    </div>
  );
}
