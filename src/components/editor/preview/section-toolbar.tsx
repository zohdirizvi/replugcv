"use client";

import { Trash01, ChevronUp, ChevronDown } from "@untitledui/icons";

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

/**
 * SectionToolbar — floats OUTSIDE the page frame, above the section.
 *
 * Rendered by PaginatedPreview as a portal-like overlay positioned
 * relative to the viewport, NOT inside the A4 content area.
 * This keeps the resume page sacred — no UI chrome polluting the document.
 */
export function SectionToolbar({
  blockTitle,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: SectionToolbarProps) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md bg-white px-1.5 py-0.5 shadow-md border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      {canMoveUp && onMoveUp && (
        <button
          onClick={onMoveUp}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
          title="Move up"
        >
          <ChevronUp className="size-3.5" />
        </button>
      )}

      {canMoveDown && onMoveDown && (
        <button
          onClick={onMoveDown}
          className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-none bg-transparent cursor-pointer transition-colors"
          title="Move down"
        >
          <ChevronDown className="size-3.5" />
        </button>
      )}

      {blockTitle && (
        <span className="text-[11px] font-semibold text-gray-700 px-1.5 select-none">
          {blockTitle}
        </span>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 border-none bg-transparent cursor-pointer transition-colors"
          title="Delete section"
        >
          <Trash01 className="size-3.5" />
        </button>
      )}
    </div>
  );
}
