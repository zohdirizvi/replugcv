"use client";

import { Plus } from "@untitledui/icons";

type AddEntryButtonProps = {
  onClick: () => void;
  label?: string;
};

export function AddEntryButton({ onClick, label = "Add entry" }: AddEntryButtonProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ bottom: -28 }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="pointer-events-auto w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-[#059669]/40 bg-[#059669]/5 py-1 text-[10px] font-medium text-[#059669] cursor-pointer hover:bg-[#059669]/10 hover:border-[#059669]/60 transition-all opacity-0 group-hover/section:opacity-100 focus:opacity-100"
        title={label}
      >
        <Plus className="size-3" />
        {label}
      </button>
    </div>
  );
}
